const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;
let accessToken = '';
// var transporter = ''
const oauth2Client = new OAuth2(
  '1046700361737-ofdi1pa8srbssh21babsasl54k9tfbmu.apps.googleusercontent.com',
  'AdGiT3-Ij67sPim8aYORF9BH',
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: '1/Rvg9xJuIPV9zlLLfmI19GrpvsoKnn-Y2ZV0AxaEy0oY'
});

const tokens = oauth2Client.refreshAccessToken((tokens) => {
  if(tokens==null){
console.log("credentials error")
  }else{
  accessToken = tokens.credentials.access_token;}
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  // secureConnection: false, // TLS requires secureConnection to be false
  // tls: {
  //   ciphers: 'SSLv3',
  //   rejectUnauthorized: false
  // }
  auth: {
    type: 'OAuth2',
    user: 'gcnextgen7@gmail.com',
    clientId: '1046700361737-ofdi1pa8srbssh21babsasl54k9tfbmu.apps.googleusercontent.com',
    clientSecret: 'AdGiT3-Ij67sPim8aYORF9BH',
    refreshToken: '1/Rvg9xJuIPV9zlLLfmI19GrpvsoKnn-Y2ZV0AxaEy0oY',
    accessToken,
  }
});


function sendEmail(receiverEmail, Subject, Body) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'gcnextgen7@gmail.com',
      to: receiverEmail,
      subject: Subject,
      text: Body
    };

     //  transporter.sendMail(mailOptions, (error, info) => {
       //  if (error) {
         //  reject(error);
         //} else {
           //resolve(`Email sent: ${info.response}`);
         //}
       //});
     //});


     transporter.sendMail(mailOptions, (error, response) => {
       if (error) {
         console.log('error', error);
       } else {
         console.log('HEERREEE', response);
         transporter.close();
       }
     });
  });
}

module.exports = {
 sendEmail
};
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.isus.emc.com',
//   port: 25,
//   secureConnection: false, // TLS requires secureConnection to be false
//   secure: false,
//   tls: {
//     ciphers: 'SSLv3',
//     rejectUnauthorized: false
//   }
// });

// function sendEmail(receiverEmail, Subject, Body) {
//   return new Promise((resolve, reject) => {
//     const mailOptions = {
//       from: 'game-changers@dell.com',
//       to: receiverEmail,
//       subject: Subject,
//       text: Body
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(`Email sent: ${info.response}`);
//       }
//     });
//   });
// }

// module.exports = {
//   sendEmail
// };