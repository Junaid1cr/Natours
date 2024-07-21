const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const MongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const port = 3000;

//Http security
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests fromt this IP,please try again later',
});

//Limiting the request rate
app.use('/api', limiter);

//Body parser, reading data from body into body parser, converts json data and makes them available in req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(MongoSanitize());

//Data sanitization against xss
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsAverage', 'difficulty'],
  }),
);

app.use((req, res, next) => {
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError('This Url does Not exist ', 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
