const express = require('express');
const { createUser, login, logout } = require('../controllers/userController');
const { isLoggedIn } = require('../controllers/userAuthentications');
const { catchAsync } = require('../controllers/errorController');

const router = express.Router();

router.route('/')
.get(catchAsync(async (req, res) => {
    const user = await isLoggedIn(req, res);
    if(user){
        res.status(200).json({ status: 'success', message: user});
    }else{
        res.status(200).json({ status: 'success', message: 'nice!'});
    }
}))
.post(login);
router.use('/logout', logout);
router.route('/signup')
.get((req, res) => {
    res.status(200).json({ status: 'success', message: 'nice!'});
})
.post(createUser);

module.exports = router;