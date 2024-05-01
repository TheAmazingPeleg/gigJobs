const rateLimit = require('express-rate-limit');
const AppError = require('./appError');

const limiter = (max, ms) => {
    return rateLimit({
        max: max, // limit each IP to 100 requests per windowMs
        windowMs: ms * 60 * 1000, // 15 minutes
        handler: function (res, req, next){
            next(new AppError('Too many requests, please try again later!', 429));
        }
    });
}

module.exports = limiter;