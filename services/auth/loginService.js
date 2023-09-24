const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const jwtConstants = require('../../constants/jwtConstants')
const user = require('../../models/User')

router.post('/', async (req, res)=>{
    try{
        const userEmail = req.body.email;
        const userPassword = req.body.password;
    
        const validUser = await validateUserCredentials(userEmail, userPassword)
        console.log(validUser)

        if(!validUser[0]){
            return res.status(406).send(validUser[1])
        }
    
        const _user = validUser[1]
        console.log(_user)
        if(_user.userPassword != userPassword){
            return res.status(406).send("Wrong Password")
        }
    
        const accessToken = jwt.sign(_user.toJSON(), jwtConstants.ACCESS_TOKEN_SECRET)
        const loginResponse = {
            token:{access_token: accessToken},
            active: _user.active,
            userId: _user._id
        }
        return res.status(200).send(loginResponse)
    }catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

router.post('/verify-otp', async (req, res)=>{
    try{
        const userId = req.body.userId
        const otp = req.body.otp
        console.log(userId, otp)

        const _user = await user.findById(userId)
        if(!_user){
            return res.status(404).send("No user found")
        }

        if(_user.otp == otp){
            const accessToken = jwt.sign(_user.toJSON(), jwtConstants.ACCESS_TOKEN_SECRET)
            await user.findByIdAndUpdate(_user._id, {active: true})
            const verifyOtpResponse = {
                token:{access_token: accessToken},
                userId: _user._id
            }
            return res.status(200).send(verifyOtpResponse)
        }

        return res.status(403).send("Wrong Otp")
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})


async function validateUserCredentials(userEmail, userPassword){
    
    if(userEmail == null || userEmail == "" || userPassword == null || userPassword == ""){
        console.log("Field cannot be empty!")
        return  [false,"Field cannot be empty!"]
    }
    const _user = await user.findOne({userEmail: userEmail})

    if(_user == null){
        console.log("No User present with this email id")
        return  [false,"No User present with this email id"]
    }

    return [true, _user]
}

module.exports = router