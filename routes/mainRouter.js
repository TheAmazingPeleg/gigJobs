const express = require('express');
const { allJobs } = require('../services/jobServices');
const { isLoggedIn } = require('../controllers/userAuthentications');
const { catchAsync } = require('../controllers/errorController');

const router = express.Router();


router.route('/').get(async (req, res) => {
    const jobs = await allJobs();
    res.status(200).json({ status: 'success', jobs , message: 'nice!'});
});

module.exports = router;