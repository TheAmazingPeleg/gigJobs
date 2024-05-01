//Global Error Object (inherits from the Error class) to handle all the errors in the application
class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //calling the parent class constructor
        this.statusCode = statusCode; //setting the status code
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //if 400 then fail else if 500 then error
        this.isOperational = true; // flagging the error as operational (known error and not a bug or extention's error)

        Error.captureStackTrace(this, this.constructor); //capturing the stack trace at the point where the error is created
    }
}

module.exports = AppError;