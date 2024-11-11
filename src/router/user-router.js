const express = require('express');
const { createUser } = require('../controller/user-controller');
const { senduserEmailBody } = require('../../service/userMail');
const { checkUserExistence }  = require('../middleware/user');
const { checkExistUser, logInAttempt, genLoginToken, verifyloginToken, logInUserIn, logOut, verifyUserSessionToken, forgetPassword, resetPassword, verifyUforgetpassToken } = require('../controller/userAuth-controller');
const { userValidation, validation } = require('../middleware/validator');
const { sendTokenEmailBody } = require('../../service/userTokenmail');
const { userLoginEmailBody } = require('../../service/userSignInEmail');
const router = express.Router();


router.post('/signup', userValidation, validation, checkUserExistence, createUser, senduserEmailBody);
router.post('/login', checkExistUser, logInAttempt, genLoginToken, sendTokenEmailBody);
router.post('/loggeIn/:userId', verifyloginToken, logInUserIn, userLoginEmailBody);
router.get('/check-session', verifyUserSessionToken);
router.get('/logout', logOut);
router.post('/forget-password', forgetPassword);
router.post('/reset-password/:token',  resetPassword);


module.exports = router