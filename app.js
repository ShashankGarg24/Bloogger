const express = require('express')
const cors = require("cors");
const cookieParser = require('cookie-parser')
const db = require('./config/db');
const app = express()
const http = require("http");
const server = http.createServer(app);
var onlineUserDictionary = {}

const io = require("socket.io")(server, {
    cors: {
      origin: "https://blooggerr.netlify.app",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
   
});


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
app.use(require("./routes/routes"))

module.exports = {sendNotificationToUser}