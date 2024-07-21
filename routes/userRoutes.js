/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const Router = express.Router();

const {
  getAllUsers,
  AddUser,
  getUser,
  UpdateUser,
  DeleteUser,
  updateMe,
  deleteMe,
  getMe,
  updateUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

const authController = require('../controllers/authController');

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
Router.get('/me', authController.protect, getMe, getUser);
Router.patch(
  '/updateMe',
  authController.protect,
  updateUserPhoto,
  resizeUserPhoto,
  updateMe,
);
Router.delete('/deleteMe', authController.protect, deleteMe);

Router.route('/').get(getAllUsers).post(AddUser);
Router.route('/:id').get(getUser).patch(UpdateUser).delete(DeleteUser);

module.exports = Router;
