class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = false;
        Error.captureStackTrace(this, this.constructor)
    }
} 

const handleValidationError = (err) => {
    const value = Object.values(err.errors).map(el => el.message);
    const message = `Invalid data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleDuplicationError = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate value: ${value}`;
    return new AppError(message, 400);
}

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleJWtError = () => new AppError("Invalid Token, Please login again", 400);
const handleJWtExpiryError = () => new AppError("Token expired, Please login again", 400);

const sendErrorDev = (err, res, req) => {
    if(req.originalUrl.startsWith('/api')) {
       return res.status(err.statusCode).json({
         status: err.status,
         err: err,
         message: err.message,
         stack: err.stack
       });
    }
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
}

const errorHandler = (err, req, res, next) => {
     err.statusCode = statusCode || '500',
      err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export { errorHandler, AppError};