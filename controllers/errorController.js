const AppError = require('../utils/appError');

const handleMongoDbError = err => {
    return new AppError(err.message, 400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
}
const sendErrorProd = (err, res) => {
    //handling the mongodb error (from unknown to known error)
    const error = {message: err.message, ...err}; //Not "braking" the err object
    if(error.code === 11000) error = handleMongoDbError(error);
    //Operational, trusted error: send message to client
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }else{
        //Logging the undefined error for alerting the developer
        console.error('ERROR: ', error);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; //default status code
    err.status = err.status || 'error'; //default status
    console.log(err);

    //response based on the environment
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }else{
        sendErrorProd(err, res);
    }
}

// Wrapping any async function in a global syntax of try-catch block and passing the error to the next middleware
const catchAsync = func => {
    return (req, res, next) => {
        func(req, res, next).catch(err => {
            next(err);
        });
    };
};

module.exports = {
    globalErrorHandler,
    catchAsync
};