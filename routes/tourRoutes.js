const express = require('express');
const fs = require('fs');
const {
  getAllTours,
  AddTour,
  getTour,
  UpdateTour,
  DeleteTour,
  aliasTopfive,
  getTourStats,
  getMonthlyPlans,
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const authController = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

//router.param('id', checkId);
router.route('/monthly-plans/:year').get(getMonthlyPlans);
router.route('/tours-stats').get(getTourStats);
router.route('/top-5-tours').get(aliasTopfive, getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistance);

router
  .route('/')
  .get(getAllTours)
  .post(authController.protect, authController.restrictTo('admin'), AddTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadTourImages,
    resizeTourImages,
    UpdateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'tour-guide'),
    DeleteTour,
  );

module.exports = router;
