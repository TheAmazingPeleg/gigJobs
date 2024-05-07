const mongoose = require('mongoose');
const userModel = require('./userModel');
const jobModel = require('./jobModel');

const jobToUserSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Job is required!'],
        validate: {
            validator: async function(){
                return (await jobModel.findById(this.job) != null)? true : false;
            },
            message: 'The job does not exists!'
        } 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'user is required!'],
        validate: {
            validator: async function(){
                return (await userModel.findById(this.user) != null)? true : false;
            },
            message: 'The user does not exists!'
        } 
    },
    status: {
        type: Number,
        enum: [0,1,2],
        default: 1
    },
    viewed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('JobToUser', jobToUserSchema);