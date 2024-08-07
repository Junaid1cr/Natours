/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const multer = require('multer');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const mulFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('This is not an image file', '400'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: mulFilter,
});

exports.updateUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (Obj, ...fields) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (fields.includes(el)) newObj[el] = Obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const user = await User.find();
//   res.status(200).json({
//     status: 'success',
//     user,
//   });
// });
exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('Your Cannot Update your Password Here'));

  const filteredObj = filterObj(req.body, 'name', 'email');
  if (req.file) filteredObj.photo = req.file.filename;

  const newUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.AddUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     data: null,
//   });
// };
exports.AddUser = factory.createOne(User);

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     data: null,
//   });
// };
exports.getUser = factory.getOne(User);
// exports.DeleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     data: null,
//   });
// };

exports.DeleteUser = factory.deleteOne(User);
exports.UpdateUser = factory.updateOne(User);
