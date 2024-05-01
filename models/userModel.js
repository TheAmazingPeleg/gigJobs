const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require(__dirname + '/../utils/appError');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required!'],
        unique: true,
        minLength: [3, 'Username must be at least 3 characters long!']
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required!'],
        minLength: [2, 'First name must be at least 2 characters long!']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required!'],
        minLength: [2, 'Last name must be at least 2 characters long!']
    },
    age: {
        type: Number,
        required: [true, 'Age is required!'],
        min: [16, 'You must be at least 16 years old!'],
        max: [99, 'You must be at most 99 years old!']
    },
    bio: {
        type: String,
        maxLength: [250, 'Bio must be at most 250 characters long!'],
    },
    photo: {
        type: String,
        required: [true, 'Photo is required!']
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
        minLength: [8, 'Password must be at least 8 characters long!']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password confirmation is required!'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords do not match!',
        }
    },
});

userSchema.methods.currectPassword = async function (password){
    return bcrypt.compare(this.password, await bcrypt.hash(password, 12));
}

//Create / Update password:
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    if(this.password != this.passwordConfirm) return next("Passwords do not match!");
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

module.exports = mongoose.model('User', userSchema);