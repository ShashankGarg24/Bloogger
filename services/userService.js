const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const {jwtAuth} = require('../middlewares/jwtAuth')
const user = require('../models/User')

router.get('/', jwtAuth, async (req, res)=>{
    try{
        return res.status(200).send(req.user)
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

router.get('/:id', async (req, res)=>{
    const userid = req.params.id
    try{
        const _user = await user.findById(userid)
        if(!_user){
            return res.status(404).send("No user found")
        }
        return res.status(200).send(_user)
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

router.post('/update-profile', jwtAuth, async(req, res)=>{
    try{
        console.log(req.user)

        const firstName = req.body.firstName
        const lastName = req.body.lastName
        var updatedUser = null
        if(firstName != null && firstName != ""){
            updatedUser = await user.findByIdAndUpdate(req.user._id, {firstName: firstName})
        }
        if(lastName != null && lastName != ""){
            updatedUser = await user.findByIdAndUpdate(req.user._id, {lastName: lastName})
        }
        console.log(updatedUser)
        return res.status(200).send("Profile Updated Successfully")
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})
router.post('/change-password', jwtAuth, async (req, res)=>{
    try{
        const password_received = req.body.password
        const curr_password = req.user.userPassword

        if(password_received !== curr_password){
            return res.status(403).send("Incorrect Password")
        }

        const new_password = req.body.newPassword
        await user.findByIdAndUpdate(req.user._id, {userPassword: new_password})
        return res.status(200).send("Password Updated Successfully")
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

module.exports = router