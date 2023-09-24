const {MAIL_CONFIG} = require('../../constants/mailConstants')
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(MAIL_CONFIG);
  
  module.exports.sendMail = async (params) => {
    try {
      let info = await transporter.sendMail({
        from: MAIL_CONFIG.auth.user,
        to: params.to, 
        subject: 'Welcome to Blooggerr!',
        html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Hello ${params.name}</h2>
          <h4>You are one step closer to create your account</h4>
          <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to activate your account and get started</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
        </div>
      `,
      });
      return info;
    } catch (error) {
      console.log(error);
      return false;
    }
  };