const mongoose = require('mongoose');
const userModel = require('./userModel');

const jobSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Reqruiter is required!'],
        validate: {
            validator: async function(){
                return (await userModel.findById(this.recruiter) != null)? true : false;
            },
            message: 'The user reqruiter does not exists!'
        } 
    },
    title: {
        type: String,
        required: [true, 'Title is required!'],
        minLength: [2, 'The title must be at least 2 characters long!']
    },
    info: {
        type: String,
        required: [true, 'Job`s info is required!'],
        minLength: [3, 'Job`s info must be at least 3 characters long!']
    },
    images: {
        type: [String],
        validate: {
            validator: function(){
                return this.images.length <= 3;
            },
            message: 'There is maximum of 3 images per job'
        }
    },
    salary: {
        type: Number,
        mix: [0, 'Salary must be a positive number!'],
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
    fromDate: {
        type: Date,
        validate: {
            validator: function(){
                return this.fromDate >= Date.now();
            },
            message: 'The starting date can not be less then now'
        },
        default: Date.now()
    },
    toDate: {
        type: Date,
        validate: {
            validator: function(){
                return this.toDate >= this.fromDate;
            },
            message: 'The finish date should be greater from starting date'
        }
    },
    status: {
        type: Number,
        enum: [0,1,2],
        default: 1
    },
});

module.exports = mongoose.model('Job', jobSchema);