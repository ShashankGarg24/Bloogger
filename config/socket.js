// var express = require("express"),
// app = express(),
// server = require('http').createServer(app),
// io = require("socket.io").listen(server);
// io.origins("*:*")
// server.listen(3000)
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "https://blooggerr.netlify.app/",
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


module.exports = {onlineUserDictionary, sendNotificationToUser}
