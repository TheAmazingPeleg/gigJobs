const express = require('express');
const { createJob, viewJob, jobRequest, approveRequest, removeRequest } = require('../controllers/jobController');

const router = express.Router();

router
.route('/:id')
.get(viewJob)
.post(jobRequest)
.patch(approveRequest)
.delete(removeRequest);

router.route('/')
.post(createJob);

module.exports = router;