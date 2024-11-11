const { sendSuccess } = require('../src/middleware');
const sendMail = require('../src/util/sendMail');

const senduserEmailBody = async (req, res) => {
    const { newUser } = req.body;
    const email = newUser.email;
    const username = newUser.username;
    const subject = 'Welcome to my Application';
    const body = `
 <body style="background-color: #091057; margin: opx auto; height: fit-content">
   <header style="background-color: #024CAA; padding: 20px; color: white; font-family: Arial, Helvetica, sans-serif; text-align: center; position:fixed; width: 100%; left: 0; top: 0;">WELCOME TO MY FIRST APPLICATION</header>
   <h1 style="color: white">Practical Class</h1>
   <p style="color: white">dear ${username} </p>
   <p style="color: white">Coding is all about passion amd through that, you will be able to face all every obstacle coming your way.</p>
   <p style="color: white">Thank for your time to review my application</p>
 </body>
    `;

    try {
        sendMail(email, subject, body);
    } catch (error) {
        console.log(error.message);
        // return sendSuccess(res, 'You have register but we can not send you a email at the moment');
        return res.status(500).json({
            successful: false,
            message: "You have register but we can not send you a email at the moment"
          });   
    }
    // return sendSuccess(res, 'Email has been successfully send to you.', newUser);
    return res.status(200).json({
        successful: false,
        message: "Email has been successfully send to you.",
        newUser: newUser
      });
};

module.exports = {
    senduserEmailBody
};