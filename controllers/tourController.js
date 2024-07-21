/* eslint-disable import/order */
const mongoose = require('mongoose');
const multer = require('multer');
const Tour = require('../models/tourModel');
const sharp = require('sharp');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const mulFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('This is not an image file', '400'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: mulFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (el, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});

exports.aliasTopfive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  //req.query.fields = 'name,price,ratingsAverage';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
// eslint-disable-next-line node/no-unsupported-features/es-syntax
// const Query = { ...req.query };
// const exclude = ['page', 'limit', 'sort'];
// exclude.forEach((el) => delete Query[el]);

// let QueryStr = JSON.stringify(Query);
// QueryStr = QueryStr.replace(/\b(gte|gt|lte|le)\b/g, (match) => `$${match}`);
// // console.log(QueryStr);
// let query = Tour.find(JSON.parse(QueryStr));

// if (req.query.sort) {
//   const SortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(SortBy);
// }

// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');

//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// if (req.query.page) {
//   const Totaltours = await Tour.countDocuments();
//   if (skip >= Totaltours) throw new Error('This Page does not exist');
// }

// query = query.skip(skip).limit(limit);
// const tours = await Tour.find().where('duration').equals('5');
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   //console.log(tours);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tours,
//     },
//   });
// });
exports.getAllTours = factory.getAll(Tour);

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) return next(new AppError('No file Found With The Given Id', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
exports.getTour = factory.getOne(Tour, { path: 'review' });

// exports.AddTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.AddTour = factory.createOne(Tour);

// exports.UpdateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) return next(new AppError('No file Found With The Given Id', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
exports.UpdateTour = factory.updateOne(Tour);
// exports.DeleteTour = catchAsync(async (req, res, next) => {
//   console.log(req.params.id);
//   const { id } = req.params;
//   const objectId = mongoose.Types.ObjectId(id);

//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) return next(new AppError('No file Found With The Given Id', 404));
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.DeleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const tours = await Tour.find({ ratingsAverage: { $gte: 4.5 } });
  console.log('Tours with ratingsAverage >= 4.5:', tours.length);

  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  console.log(stats);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}/01/01`),
          $lte: new Date(`${year}/12/31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        names: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    return next(new AppError('Please Enter the Latitude and Langitude'));
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    tours,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(new AppError('Please Enter the Latitude and Langitude'));
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: distance,
  });
});
