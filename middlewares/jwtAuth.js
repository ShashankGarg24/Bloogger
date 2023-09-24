const jwt = require('jsonwebtoken')
const jwtConstants = require('../constants/jwtConstants')
const user = require('../models/User')
 
const getUserFromAuth = async (authHeader)=>{
    const token = authHeader.split(" ")[1]
    const _user = jwt.verify(token, jwtConstants.ACCESS_TOKEN_SECRET)
    if(_user == null){
        return res.status(404).send("Token error")
    }
    const userObj = await user.findById(_user._id)
    if(userObj == null){
        return res.status(404).send("User Not Found")
    }
    return userObj
}

const jwtAuth = async (req, res, next) => {
    try{
        const authHeader = req.get("Authorization")
        console.log(authHeader)
        if(authHeader && authHeader.startsWith("Bearer ")){
            var _user = await getUserFromAuth(authHeader)
            req.user = _user
            next()
        }
    }catch(err){
        console.log(err)
        res.clearCookie("accessToken")
        return res.redirect("/")
    }
}

module.exports = {jwtAuth, getUserFromAuth}
