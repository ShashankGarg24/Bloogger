const express = require('express')
const cors = require("cors");
const cookieParser = require('cookie-parser')
const blogRouting = require('./services/blogService')
const categoryRouting = require('./services/admin/categoryService')
const loginService = require('./services/auth/loginService')
const registerService = require('./services/auth/registerService')
const userService = require('./services/userService')
const commentRouting = require('./services/commentService')
const db = require('./config/db');
// const socket = require('./config/socket');
const app = express()
const http = require("http");
const server = http.createServer(app);


server.listen(8080, ()=>{
    console.log("Server Started at port 8080....")
})

const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/register', registerService)
app.use('/login', loginService)
app.use('/blogs', blogRouting)
app.use('/account', userService)
app.use('/admin/category', categoryRouting)
app.use('/comment', commentRouting)

exports.server = server