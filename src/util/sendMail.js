const nodemailer = require("nodemailer");

const sendMail = (to, subject, body) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // tls: {
        //   rejectUnauthorized: true
        // }
      });


      const emailBody = {
        from: process.env.APP_EMAIL,
        replyTo: process.env.APP_EMAIL,
        to: to,
        subject: subject,
        html: body
      };


      transporter.sendMail(emailBody, (err, success) => {
        if(err){
          console.log(err);
        };
        if(success){
          console.log(success.messageId)
        }
      })
};

module.exports = sendMail