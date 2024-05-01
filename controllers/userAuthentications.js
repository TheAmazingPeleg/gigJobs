const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const isLoggedIn = async (req, res) =>{
    console.log('hey');
    if(!req.cookies || !req.cookies['userJWT'] || !req.cookies['userJWT'] === undefined)
        return null;
    const decodedUserID = jwt.verify(req.cookies['userJWT'], process.env.JWT_SECRET);
    if(decodedUserID === undefined)
        return null;
    const user = await userModel.findById(decodedUserID.id);
    return user;
};

module.exports = {
    isLoggedIn    
};