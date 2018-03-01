const nodemailer = require('nodemailer');
const env = require('node-env-file');
env('Credentials.env');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.USER,
    accessToken: process.env.ACCESS_TOKEN
  }
});

function sendEmail(receiverEmail, Subject, Body) {
  const mailOptions = {
    from: process.env.USER,
    to: receiverEmail,
    subject: Subject,
    text: Body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}
sendEmail('dalia.mostafa@emc.com', 'subject2', 'body');
