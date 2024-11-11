const { logInOtp, sendError, generateCodeString } = require("../middleware");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const tokenVerification = require('../models/tokenVerification');
const { isValidObjectId } = require("mongoose");
const jwt = require('jsonwebtoken');
const forgetpassToken = require("../models/forgetpassToken");


const checkExistUser = async (req, res, next) => {
    const { logIn, password } = req.body;
    let checkUserExistence

    try {
        const checkUserExistence = await User.findOne({email: logIn});
        if(!checkUserExistence){
            return res.status(401).json({
                success: false,
                message: 'Invalid Email address, signup instead' 
            });
        };
       
        // return res.status(200).json({
        //     success: true,
        //     message: 'valid'
        // });
        
       req.body = { checkUserExistence, password };
       next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `something went wrong please try again`
        });
    }
};

const logInAttempt = async (req, res, next) => {
    const { checkUserExistence, password } = req.body;

   
    try {
        const hashpassword = checkUserExistence.password;
        const isPasswordCorrect = bcrypt.compareSync(password, hashpassword);
        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: 'incorrect password, please input the correct password'
            });
        };
        // return res.status(200).json({
        //     success: true,
        //     message: "Login"
        // });
        req.body = { checkUserExistence };
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        })
    }
   
};


//generate otp function
const genLoginToken = async (req, res, next) => {
    const { checkUserExistence } = req.body;

    const otp = logInOtp(6);
    const hashotp = bcrypt.hashSync(otp);
   

        const existingUserToken = await tokenVerification.findOne({owner: checkUserExistence._id});
        if(existingUserToken){
            try {
                await tokenVerification.findByIdAndDelete(existingUserToken._id);
                console.log('done');
            } catch (error) {
                console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        });
            };
        };
 

    const userToken = new tokenVerification({
        owner: checkUserExistence._id,
        token: hashotp
    });
    try {
        await userToken.save();
        // return res.status(200).json({
        //     success: true,
        //     message: '2FA verification token',
        //     data: userToken.token
        // });

        req.body = {checkUserExistence, otp};
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        });
    };    
};

const verifyloginToken = async (req, res, next) => {
    const { otp } = req.body;
    const { userId } = req.params;

    if(!isValidObjectId(userId)){
        return res.status(401).json({
            success: false,
            message: 'Invalid Id'
        })
    };

    try {
    const userToken = await tokenVerification.findOne({owner: userId})
        if(!userToken){
            return res.status(401).json({
                success: false,
                messsage: 'no login attempt detect'
            });
        };

        

        const hashToken = userToken.token;
        const isTokenCorrect = bcrypt.compareSync(otp, hashToken);
        if(!isTokenCorrect){
            return res.status(401).json({
                success: false,
                mesaage: 'Invalid token supply, please provide valid token'
            });
        };
    
        try {
            const user = await User.findById(userId);
            
            // return res.status(200).json({
             //    success: true,
             //    message: `login successfully with generate token ${user}`
           //  });
            req.body = { user };
            next();
        } catch (error) {
            
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        });
    }
};

const logInUserIn = (req, res, next) => {
    const { user } = req.body;
    console.log('my user', user);
    const loginSessionToken = jwt.sign({userId: user._id}, process.env.JWT_USER_SECRET_KEY, {
        expiresIn: '30m'
    });


    res.cookie(String(user._id), loginSessionToken, {
        path: '/',
        expires: new Date(Date.now() + 1000 * 60 * 30),
        httpOnly: true,
        sameSite: 'lax'
    })

    req.body = { user, loginSessionToken };
    next();
};

const verifyUserSessionToken = (req, res, next) => {
    const cookie = req.headers.cookie;

    if(!cookie){
        return res.status(401).json({
            success: false,
            message: 'no cookie found, signin before you can be authorized'
        });
    };

    const token = cookie.split('=')[1];
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'no cookie found'
            });
        };

        jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, success) => {
            if(err){
                return res.status(401).json({
                    success: false,
                    message: 'unverify session'
                });
            };
            console.log('session has been create successfully', success);

            req.id = success.userId;
            next();
        })
};

//logout
const logOut = (req, res) => {
    const cookie = req.headers.cookie;
    console.log('cookie', cookie);
    if(!cookie){
        return sendError(res, 'No cookie found, You are not authorize to access this resource.');
    };

    //Extracting my token from perticular admin
    const token = cookie.split('=')[1];
    if(!token){
        return sendError(res, 'No session cookie found, login first');
    };

    //Decoding my cookies
    jwt.verify(String(token), process.env.JWT_SECRET_KEY, (error, success) => {
        if(error){
            return sendError(res, 'Your session cannot be verified, you are not authorize to access this resource')
        };


         //clearing the cookie from my browser
         res.clearCookie([`${success.adminId}`]);

         //setting the ID value to empty cokies to clear the cookie from the server side.
        //  res.cookies[`${success.adminId}`].pop();
         return sendError(res, 'Successfully logged out.');
         });

};



//Forget password
const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        };

        // const userID = await forgetpassToken.findById(user._id);
        // if(userID){
        //     try {
        //         await forgetpassToken.findByIdAndDelete(user._id)
        //     } catch (error) {
        //         return res.status(500).json({
        //             success: true,
        //             message: "Unable to fecth id, something went wrong"
        //         });
        //     };
        // };
        

        const token = generateCodeString(30);
        console.log(token);
        //reset password token
       const hashEmailToken = bcrypt.hashSync(token);
        const expiresToken = new Date(Date.now() + 1000 * 60 * 10); //30 minutes
        
        //adding to DB
        user.resetPasswordToken = token;
        user.resetPasswordExpiresAt = expiresToken;

    console.log('my user data', user);
        // const genToken = new forgetpassToken({
        //     owner: user._id,
        //     resetPasswordToken: hashEmailToken,
        //     resetPasswordExpiresAt: expiresToken
        // });

        // const newUser = new User({...req.body});
        
        try {
            const data = await user.save();
            return res.status(200).json({
                success: true,
                message: 'email verify',
                data: data
            });
            req.body = { data, token };
            next()
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'something went wrong, provide valid information',
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'something went wrong, please try again'
        });
    };
};

const verifyUforgetpassToken = async (req, res, next) => {
    const { data, token } = req.body;

    const verify = bcrypt.compareSync(token, data.resetPasswordToken);
    console.log('verify token#', verify);
    if(!verify){
        return res.status(401).json({
            success: false,
            message: 'Unable to verify'
        })
    };
    console.log('token get', token);
    try {
        if(data){
        return res.status(200).json({
            success: true,
            message: 'successfully generate forget password token',
            data: data
        });
    };
    req.body = { data, user };
    next();
   } catch (error) {
        return res.status(401).json({
            success: false,
            message: "unable to fetch data"
        });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

  
   const user = await User.findOne({
    resetPasswordToken: token, 
    resetPasswordExpiresAt: {$gt: Date.now()}});

    // resetPasswordToken: token,
    // resetPasswordExpiresAt: {$gt: Date.now()}
   console.log('payload#', user);

   if(!user){
    return res.status(401).json({
        success: false,
        message: "You're not authorized to perform this action"
    });
   };

    

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    try {
       const data = await user.save();
        return res.status(200).json({
            success: true,
            message: "password reset successfully",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        });
    }
}


module.exports = {
    checkExistUser,
    logInAttempt,
    genLoginToken,
    verifyloginToken,
    logInUserIn,
    verifyUserSessionToken,
    logOut,
    forgetPassword,
    verifyUforgetpassToken,
    resetPassword
}