const express = require('express')
const router = express.Router()
const {jwtAuth, getUserFromAuth} = require('../middlewares/jwtAuth')
const user = require('../models/User')
const User = require('../models/User')
const { getBlogsForCardsFrom } = require('../utilities/blogUtilities')



router.get('/bookmarks', jwtAuth, async (req, res)=>{
    console.log("GEt bookmarks")
    try{
        const user = await User.findById(req.user._id)
        var blogs = await getBlogsForCardsFrom(user.bookmarks)
        console.log(blogs)
        return res.status(200).send(blogs)
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

router.get('/myBlogs', jwtAuth, async (req, res)=>{
    console.log("GEt my blogs")

    try{
        console.log("Hit")
        const user = await User.findById(req.user._id)
        var blogs = await getBlogsForCardsFrom(user.blogs)
        console.log(blogs)
        return res.status(200).send(blogs)
    }
    catch(err){
        console.log(err)
        return res.status(400).send("Service Unavailable")
    }
})

router.get('/:id', async (req, res)=>{
    console.log("GEt user")
    const isHeaderPresent = req.get("isHeaderPresent")
    const bearerToken = req.get("header")
    const userId = req.params.id
    try{
        var isLocalUserLoggedIn = false;
        console.log(userId)
        var user = await User.findById(userId)
        console.log(user)

        if(!user){
            return res.status(404).send("No User Found")
        }
        if(isHeaderPresent){
            const _user = await getUserFromAuth(bearerToken)
            const _userId = _user?._id.valueOf()
            if(userId == _userId){
                console.log("In")
                isLocalUserLoggedIn = true;
                user = _user
            }
        }

        const userResp = {
            user: user,
            isLocalUserLoggedIn: isLocalUserLoggedIn
        }
        console.log(userResp)
        return res.status(200).send(userResp)
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