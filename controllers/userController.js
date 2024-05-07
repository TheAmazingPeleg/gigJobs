const userModel = require('../models/userModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('./errorController.js');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { isLoggedIn } = require('./userAuthentications.js');
dotenv.config({ path: __dirname + '/utils/.env.config' });

const userToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const findByUsername = async (username) => {
    return await userModel.find({username});
}

const findByEmail = async (email) => {
    return await userModel.find({email});
}

const createUser = catchAsync(async (req, res, next) => {
    const { username, email, firstName, lastName, age, bio, photo, password, passwordConfirm  } = req.body;
    const ageStr = age.toString();
    if(!username || !validator.isAlphanumeric(username) || !validator.isLength(username, { min: 3, max: 25 }))
        return next(new AppError('The username should contains only abc letters and numbers between 3 to 25 letters', 400));
    if(!email || !validator.isEmail(email))
        return next(new AppError('The email should be in the email`s format', 400));
    if(!firstName || !validator.isAlpha(firstName) || !validator.isLength(firstName, { min: 2, max: 30 }))
        return next(new AppError('The first name should contains only abc letters between 2 to 30 letters', 400));
    if(!lastName || !validator.isAlpha(lastName) || !validator.isLength(lastName, { min: 2, max: 30 }))
        return next(new AppError('The last name should contains only abc letters between 2 to 30 letters', 400));
    if(!age || !validator.isNumeric(ageStr) || !(parseInt(ageStr) > 15 && parseInt(ageStr) < 100))
        return next(new AppError('The age should contains only numbers between 16 to 99', 400));
    if(bio && !validator.isLength(bio, { max: 250 }))
        return next(new AppError('The bio should be less then 250 letters', 400));
    if(!photo || !validator.isURL(photo))
        return next(new AppError('The photo should be URL', 400));
    if(!password || !passwordConfirm || !validator.isLength(password, { min: 8, max: 250 }) || password != passwordConfirm)
        return next(new AppError('The password should be between 8 to 250 and matchs', 400));
    if((await findByUsername(username)).length != 0)
        return next(new AppError('The username is taken', 400));
    if((await findByEmail(email)).length != 0)
        return next(new AppError('The email is taken', 400));
    const user = await userModel.create({ username, email, firstName, lastName, age: ageStr, bio, photo, password, passwordConfirm });
    res.status(201).json({ status: 'created', message: user});
});

const login = catchAsync(async (req, res, next) => {
    if(await isLoggedIn(req, res))
        return next(new AppError('You must to logout before logging in!', 400));
    const { username, password } = req.body;
    let user = await findByEmail(username);
    if(!username || !password)
        return next(new AppError('Please provide username/email and password', 401));
    if(user.length === 0)
        user = await findByUsername(username);
    if(user.length === 0)
        return next(new AppError('No user exists!', 401));
    user = user[0];
    if(!user.currectPassword(password))
        return next(new AppError('The password is wrong!', 401));
    const userJWT = userToken(user._id);
    res.status(200)
    .cookie('userJWT', userJWT, {expire: 10 * 24 * 60 * 60 * 1000 + Date.now(), secure: true})
    .json({
        status: 'success',
        message: 'logged in'
    });
});

const logout = catchAsync(async (req, res, next) => {
    if(!await isLoggedIn(req, res))
        return next(new AppError('There is no logged in user', 400));
    res.status(200)
    .clearCookie('userJWT')
    .json({
        status: 'success',
        message: 'logged out'
    });
});

module.exports = {
    createUser,
    login,
    logout
}