const nodemailer = require('nodemailer');

// Configure nodemailer with your Mailtrap SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP,
  port: process.env.EMAIL_PORT, 
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Export a function to send emails
module.exports.sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: 'info@gogreenconservation.eu', // Sender address
    to, // List of recipients
    subject, // Subject line
    text, // Plain text body
    html // HTML body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
};