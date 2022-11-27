var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var dotenv = require('dotenv')
dotenv.config()


var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'corklebeck@gmail.com',
    pass: process.env.GMAILPW
  }
}));

var mailOptions = {
  from: 'corklebeck@gmail.com',
  to: 'moomanchicken@gmail.com',
  subject: 'Sending Email using Node.js[nodemailer]',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});  