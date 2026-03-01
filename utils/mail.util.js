const nodemailer = require('nodemailer');

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  throw new Error('MAIL credentials missing');
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendOtpMail = async (email, code) => {
  await transporter.sendMail({
    from: `"No Reply" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <h2>OTP Verification</h2>
      <h1>${code}</h1>
      <p>Expires in 5 minutes</p>
    `,
  });
};