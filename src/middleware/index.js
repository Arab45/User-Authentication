const sendError = (res, message) => {
    return res.status(401).json({
        success: false,
        message: message
    });
};

const sendSuccess = (res, message, data) => {
    return res.status(200).json({
        success: true,
        message: message,
        data: data
    });
};

const logInOtp = (len) => {
    let otp = [];

    for(i = 0; i < len; i++){
        const randomNum = Math.round(Math.random() * 9);
    otp += randomNum;
        };
        return otp;
};

 const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
 const generateCodeString = (length) => {
   let result = '';
   const charactersLength = characters.length;
   for(let i = 0; i < length; i++){
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
   };
   return result;
}

module.exports = {
    sendError,
    sendSuccess,
    logInOtp,
    generateCodeString
};