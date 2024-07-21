/* eslint-disable no-lonely-if */
const AppError = require('../utils/appError');

const handleCastingError = (error) => {
  const message = 'This Id is invalid';
  return new AppError(message, 400);
};

const handleDuplicateFields = (error) => {
  const message = 'This is a duplicate field value';
  return new AppError(message, 400);
};

const handleValidationError = (error) => {
  const message = 'Invalid input data';
  return new AppError(message, 400);
};

const handleJWTexpiredError = () => new AppError('Token expired', 401);

const handleInvalidSignatureError = () =>
  new AppError('Invalid token signature', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log('apierror');
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  } else {
    console.log('errrrrrrrrrrrrrrrrror');
    console.log(err.message);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastingError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTexpiredError();
    if (error.name === 'JsonWebTokenError')
      error = handleInvalidSignatureError();

    sendErrorProd(error, req, res);
  }
};
