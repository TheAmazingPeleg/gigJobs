const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/utils/.env.config' });
const mongoose = require('mongoose');
const mainRouter = require(__dirname + '/routes/mainRouter');
const userRouter = require(__dirname + '/routes/userRouter');
const jobRouter = require(__dirname + '/routes/jobRouter');
const cookieParser = require('cookie-parser'); 
const cors = require('cors');

const app = express();

// Enable for react to use fetch
app.use(cors());


app.use(cookieParser()); 

//Including Security Middlewares
const limiter = require(__dirname + '/utils/rateLimiter');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

//Including the error handling mechanism
const AppError = require(__dirname + '/utils/AppError');
const { globalErrorHandler, catchAsync } = require('./controllers/errorController');

//Security Middlewares
//Helmet - HTTP Security
app.use(helmet());
//Rate Limiter (Preventing Brute Force Attacks)
app.use(limiter(process.env.MAX_REQUESTS, process.env.LIMIT_PER_MINUTES));
//Limiting the body size of the request
app.use(express.json({ limit: '10kb' }));
//Data sanitization against NoSQL query injection (Operator Injection)
app.use(mongoSanitize());
//Data sanitization against XSS (HTML Tags Injection)
app.use(xss());

//Handling the general uncaught exceptions (Syntax errors, etc.)
process.on('uncaughtException', err => {
    console.error(err.name, err.message);
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    //Shutting down after server is properly closed
    //server.close(() => {
        process.exit(1);
    //});
});


mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log('[DATABASE] Connected successfully - ' + process.env.CONNECTION_STRING);
}).catch(err => {
    console.error('[DATABASE] Connection failed!');
    console.error(err);
});

/* Write here your code */
app.use('/user', userRouter);
app.use('/job', jobRouter);
app.route('/').get(mainRouter);

/* Good luck! */






//Global Unknown Route Handler - using the appError class
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Handling the global error
app.use(globalErrorHandler);

//Handling the general unhandled promise rejections (The db is down, etc.)
process.on('unhandledRejection', err => {
    console.error(err.name, err.message);
    console.error('UNHANDLED REJECTION! Shutting down...');
    //Shutting down after server is properly closed
    //server.close(() => {
        process.exit(1);
    //});
});

app.listen(process.env.PORT || 8080, () => {
    console.log('[SERVER] Up and running on port: '+ process.env.PORT || 3000);
});