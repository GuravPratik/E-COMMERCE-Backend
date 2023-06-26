const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: "pratikwork70@gmail.com", // sender address
    to: options.toEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: "<b>Hello world?</b>", // html body
  };

  await transporter.sendMail(message);
};

module.exports = mailHelper;
