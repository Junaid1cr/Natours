const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) return new AppError('No Tour With That Name');
  console.log(tour);
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login In',
  });
});

exports.getAccount = (req, res) => {
  console.log('pddfa');
  try {
    res.status(200).render('account', {
      title: 'My Profile',
      user: req.user || {},
    });
  } catch (error) {
    console.error('Error rendering account page:', error);
    res.status(500).send('An error occurred while rendering the account page');
  }
};

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//     res.status(201).render('account', {
//       title: 'My Profile',
//       user: user,
//     }),
//   );
// });
