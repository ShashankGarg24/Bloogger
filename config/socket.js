var onlineUserDictionary = {}
 const app = require("../app")
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

app.io.on("connection", (socket) => {
 socket.on("addNewOnlineUser", (userId)=>{
   addOnlineUser(userId, socket.id)
   console.log(onlineUserDictionary)
   app.io.to(socket.id).emit("greet", "You are connected " + userId)
 })
 socket.on("disconnect", (userId)=>{
   deleteOnlineUser(userId)
   console.log(onlineUserDictionary)
   console.log("bye")
 })
});


const sendNotificationToUser = (senderId, receiverId, blogId, type) =>{
   if(senderId, receiverId, blogId){
       app.io.to(onlineUserDictionary[receiverId]).emit("notifications", ({senderId, blogId, type}))
   }
}

module.exports = {sendNotificationToUser}