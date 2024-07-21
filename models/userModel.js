const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Name Is Required'],
  },
  email: {
    type: String,
    required: [true, 'User Email Is Required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Enter A Valid Email'],
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'tour-guide', 'admin', 'guide', 'lead-guide'],
  },
  password: {
    type: String,
    required: [true, 'Password Is Required'],
    minlength: 8,
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordConfirm: {
    type: String,
    // required: [true, 'Please Confirm Your Password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  ResetPasswordToken: String,
  ResetPasswordExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const e = await bcrypt.compare(candidatePassword, userPassword);

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestam) {
  if (this.passwordChangedAt) {
    const ChangedTimestam = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return ChangedTimestam > JWTtimestam;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.ResetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.ResetPasswordExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.ResetPasswordToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
