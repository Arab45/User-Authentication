
const { sendError } = require(".");
const User = require("../models/User");

const checkUserExistence = async (req, res, next) => {
    const { email, username } = req.body;

    // console.log(sendError());

    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            // return sendError(res, 'email already exist, please input new email.', 500);
            return res.status(500).json({
                successful: false,
                message: "email already exist, signup instead."
              });
        };
        next();
    } catch (error) {
        // return sendError(res, `something went wrong, unable to perform - ${error}`, 500);
        return res.status(500).json({
            successful: false,
            message: "something went wrong"
          });
    }
};

module.exports = { checkUserExistence };