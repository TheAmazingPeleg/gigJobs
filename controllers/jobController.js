const userModel = require('../models/userModel.js');
const jobModel = require('../models/jobModel.js');
const jobToUserModel = require('../models/jobToUserModel.js');
const AppError = require('../utils/appError.js');
const validator = require('validator');
const { catchAsync } = require('./errorController.js');
const { isLoggedIn } = require('./userAuthentications.js');

const findByNum = async (job) => {
    const jobs = await jobModel.find();
    if(job < 1 || job > jobs.length)
        return null
    return jobs[--job];
}

const createJob = catchAsync(async (req, res, next) => {
    if(!isLoggedIn)
        return next(new AppError('Only users can create a new job!', 400));
    const { recruiter, title, info, images, salary, fromDate, toDate } = req.body;
    let salaryStr = "0";
    if(salary)
        salaryStr = salary.toString();
    if(!title || !validator.isLength(title, { min: 2, max: 100 }))
        return next(new AppError('The title should contains only abc letters and numbers between 2 to 100 letters', 400));
    if(!info || !validator.isLength(info, { min: 3, max: 500 }))
        return next(new AppError('The job`s info should between 3 to 500 letters', 400));
    if(!salary || !validator.isNumeric(salaryStr) || !(parseInt(salaryStr) >= 0))
        return next(new AppError('The salary should be higher then 0', 400));
    let flag = true;
    if(images){
        if(images.length > 3)
            flag = false;
        if(flag){
            images.forEach((el) => {
                if(!validator.isURL(el))
                    flag = false;
            });
        }
    }
    if(!flag)
        return next(new AppError('There is maximum of 3 images and they should be URLs', 400));
    if(!fromDate || fromDate < Date.now())
        return next(new AppError('The starting date should be bigger then now', 400));
    if(!toDate || toDate < fromDate)
        return next(new AppError('The finishing date should be bigger the starting date', 400));
    if(!await userModel.findById(recruiter))
        return next(new AppError('The recruiter does not exists', 400));
    const job = await jobModel.create({ recruiter, title, info, images, salary, fromDate, toDate });
    res.status(201).json({ status: 'created', message: job});
});

const viewJob = catchAsync(async (req, res, next) => {
    if(!req.params.id)
        return next(new AppError('Please enter job id', 400));
    const jobId = req.params.id;
    const job = await findByNum(jobId);
    if(!job)
        return next(new AppError('There is no job with that id', 400));
    res.status(200)
    .json({
        status: 'success',
        message: job
    });
});


const jobRequest = catchAsync(async (req, res, next) => {
    const user = await isLoggedIn(req, res);
    if(!user)
        return next(new AppError('You must to login to do this action', 400));
    if(!req.params.id)
        return next(new AppError('Lack of job!', 400));
    const job = await findByNum(req.params.id);
    if(!job)
        return next(new AppError('There is no job with that id', 400));
    if(user.equals(job.recruiter))
        return next(new AppError('You can not hire yourself!', 400));
    if(await jobToUserModel.find({ job: job._id, user: user._id }).length > 0)
        return next(new AppError('You applied to this job!', 400));
    await jobToUserModel.create({ job: job._id, user: user._id, status: 0 });
    res.status(201).json({ status: 'created', message: 'Sent a request for the job'});
});

const approveRequest = catchAsync(async (req, res, next) => {
    const user = await isLoggedIn(req, res);
    if(!user)
        return next(new AppError('You must to login to do this action', 400));
    if(!req.params.id)
        return next(new AppError('Lack of job!', 400));
    const job = await findByNum(req.params.id);
    if(!job)
        return next(new AppError('There is no job with that id', 400));
    if(!user.equals(job.recruiter))
        return next(new AppError('Only the creator of the job can hire people', 400));
    if(!req.body.reqId)
        return next(new AppError('The request does not exists', 400));
    const requestForJob = await jobToUserModel.findOne({ _id: req.body.reqId, job: job._id, status: { $ne: 1 } });
    if(!requestForJob)
        return next(new AppError('The request does not exists', 400));
    requestForJob.status = 1;
    requestForJob.viewed = false;
    requestForJob.save();
    res.status(201).json({ status: 'created', message: 'The user approved'});
});

const removeRequest = catchAsync(async (req, res, next) => {
    const user = await isLoggedIn(req, res);
    if(!user)
        return next(new AppError('You must to login to do this action', 400));
    if(!req.params.id)
        return next(new AppError('Lack of job!', 400));
    const job = await findByNum(req.params.id);
    if(!job)
        return next(new AppError('There is no job with that id', 400));
    if(!user.equals(job.recruiter))
        return next(new AppError('Only the creator of the job can delete a request', 400));
    if(!req.body.reqId)
        return next(new AppError('The request does not exists', 400));
    const requestForJob = await jobToUserModel.findOne({ _id: req.body.reqId, job: job._id, status: { $ne: 2 } });
    if(!requestForJob)
        return next(new AppError('The request does not exists', 400));
    requestForJob.status = 2;
    requestForJob.viewed = false;
    requestForJob.save();
    res.status(201).json({ status: 'deleted', message: 'The request deleted for the user'});
});
module.exports = {
    createJob,
    viewJob,
    jobRequest,
    approveRequest,
    removeRequest
}