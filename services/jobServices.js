const jobModel = require('../models/jobModel');

const allJobs = async () => {
    return await jobModel.find({"status": { $eq:1 } }).select('-__v');
}

module.exports = {
    allJobs
}
