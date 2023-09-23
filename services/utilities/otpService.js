const otpGenerator = require('otp-generator')
const {OTP_LENGTH, OTP_CONFIG} = require('../../constants/otpConstants')

module.exports.generateOTP = () => {
  console.log(OTP_LENGTH)
  console.log(OTP_CONFIG)
    const OTP = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
    return OTP;
};