const {check, validationResult} = require('express-validator');
const { sendError } = require('.');

const userValidation = [
    check('name').trim().not().isEmpty().withMessage('name is missing'),
    check('email').trim().not().isEmpty().withMessage('email is missing').isEmail().withMessage('invalid email'),
    check('username').trim().not().isEmpty().withMessage('username is missing'),
    check('passwor').trim().not().isEmpty().withMessage('password is missing')
]

const validation = (req, res, next) => {
    const error = validationResult(req).array();
    if(error.length < 0){
        return sendError(res, error[0].msg);
        // return res.status(500).json({
        //     successful: false,
        //     message: error[0].msg
        //   });
    }
    next()
};

module.exports = {
    userValidation,
    validation
}