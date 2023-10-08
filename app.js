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
const socket = require('./config/socket');
const app = express()

const express = require("express");
const http = require("http");

const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "https://blooggerr.netlify.app",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
   
});

 var onlineUserDictionary = {}

 const addOnlineUser =(userId, socketId)=>{
    console.log("New user added to socket")
    onlineUserDictionary[userId] = socketId
 }

 const getOnlineUser =(userId)=>{
    return onlineUserDictionary[userId]
 }

 const deleteOnlineUser =(userId)=>{
    delete onlineUserDictionary[userId]
 }
io.on("connection", (socket) => {
  socket.on("addNewOnlineUser", (userId)=>{
    addOnlineUser(userId, socket.id)
    console.log(onlineUserDictionary)
    io.to(socket.id).emit("greet", "You are connected " + userId)
  })
  socket.on("disconnect", (userId)=>{
    deleteOnlineUser(userId)
    console.log(onlineUserDictionary)
    console.log("bye")
  })
});


const sendNotificationToUser = (senderId, receiverId, blogId, type) =>{
    if(senderId, receiverId, blogId){
        io.to(onlineUserDictionary[receiverId]).emit("notifications", ({senderId, blogId, type}))
    }
 }



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
