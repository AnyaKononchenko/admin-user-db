const nodemailer = require("nodemailer");
const dev = require("../config");

const sendEmail = async (emailContent) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: dev.mailer.sender,
        pass: dev.mailer.password,
      },
    });

    const mailOptions = {
      from: dev.mailer.sender, 
      to: emailContent.email,
      subject: emailContent.subject, 
      html: emailContent.html,
    }

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Error occured while sending the email: ${error.message}`);
      } else {
        console.log(`The email is sent: ${info.response}`);
      }
    });

  } catch (error) {
    console.log(`Could not send the email: ${error.message}`);
  }
};

module.exports = sendEmail;
