const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:"smtp.isus.emc.com",
  port: 25,
  secureConnection: false, // TLS requires secureConnection to be false
  secure:false,
  tls: {
      ciphers:'SSLv3',
      rejectUnauthorized:false
  }
});

function sendEmail(receiverEmail, Subject, Body) {
  const mailOptions = {
    from: "game-changers@dell.com",
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
