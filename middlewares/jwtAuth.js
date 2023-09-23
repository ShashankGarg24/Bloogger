const jwt = require('jsonwebtoken')
const jwtConstants = require('../constants/jwtConstants')
const user = require('../models/User')
 
const getUserFromAuth = (authHeader)=>{
    const token = authHeader.split(" ")[1]
    const _user = jwt.verify(token, jwtConstants.ACCESS_TOKEN_SECRET)

    return _user
}

const jwtAuth = async (req, res, next) => {
    try{
        const authHeader = req.get("Authorization")
        console.log(authHeader)
        if(authHeader && authHeader.startsWith("Bearer ")){
            const _user = getUserFromAuth(authHeader)
            if(_user == null){
                return res.status(404).send("Token error")
            }
            const userObj = await user.findById(_user._id)
            if(userObj == null){
                return res.status(404).send("User Not Found")
            }
            req.user = userObj
            next()
        }
    }catch(err){
        console.log(err)
        res.clearCookie("accessToken")
        return res.redirect("/")
    }
}

module.exports = {jwtAuth, getUserFromAuth}
