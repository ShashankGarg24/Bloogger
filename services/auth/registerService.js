const express = require('express')
const router = express.Router()
const {sendMail} = require('../utilities/MailService')
const {generateOTP} = require('../utilities/otpService')
const user = require('../../models/User')

router.post('/', async (req, res)=>{
    try{
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const userEmail = req.body.email
        const userPassword = req.body.password
        var validUser = await validateUserInformation(firstName, userEmail, userPassword)

        if(!validUser[0]){
            return res.status(406).send(validUser[1])
        }
        
        const signUpOtp = generateOTP()

        var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateTime = new Date().toLocaleDateString([],dateOptions);

        const _user = new user({
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail,
            userPassword: userPassword,
            otp: signUpOtp,
            createdOn: dateTime
        })
        
        await _user.save()
    
        const resp = sendMail({
            to: userEmail,
            name: firstName+" "+lastName,
            OTP: signUpOtp,
        })

        const registerMessage = {
            message: "User Created successfully",
            userId: _user._id
        }
    
        return res.status(201).send(registerMessage)
    }catch(err){
        console.log(err)
        return res.status(400).send(err)
    }
})

router.post('/validate', async (req, res)=>{
    try{

        const _user = await user.findOne({userEmail: req.body.email})
        const otp = req.body.otp

        if(_user && otp !== _user.otp){
            throw "Invalid Otp"
        }

        await user.findByIdAndUpdate(_user._id, {active: true})

        res.status(201).send("User Registered successfully")
    }catch(err){
        res.status(400).send(err)
        console.log(err)
    }
})

async function validateUserInformation(firstName, userEmail, userPassword){
    
    if(firstName == null || firstName == "" || userEmail == null || userEmail == "" || userPassword == null || userPassword == ""){
        console.log("Field cannot be empty!")
        return  [false,"Field cannot be empty!"]
    }
    const _user = await user.findOne({userEmail: userEmail})
    if(_user != null){
        console.log("User already present with this email Id")
        return  [false,"User already present with this email Id"]
    }

    if(!validateEmail(userEmail)){
        console.log("Please enter valid email")
        return  [false,"Please enter valid email"]
    }

    return [true, _user]
}

function validateEmail(email){
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    return regex.test(email)
};

module.exports = router