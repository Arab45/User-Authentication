const { sendError, sendSuccess } = require("../middleware/index");
const bcrypt = require('bcryptjs');
const User = require('../models/User')



const createUser = async (req, res, next) => {
  const { name, email, username, password } = req.body;


  const lowerCaseEmail = req.body.email.toLowerCase();
  const lowerCaseUsername = req.body.username.toLowerCase();


  const salt = bcrypt.genSaltSync(10);
  const hashpassword = bcrypt.hashSync(password, salt);

  const newUser = new User({
    name,
    email: lowerCaseEmail,
    username: lowerCaseUsername,
    password: hashpassword

  });

    try {
      await newUser.save();
      // return sendSuccess(res, 'sucessful sign up', newUser);
      req.body = { newUser };
      next();
    } catch (error) {
    //  return sendError(res, 'something went wrong', 500);
    return res.status(500).json({
      successful: false,
      message: "something went wrong"
    });
    }
  };

module.exports = {
  createUser
};