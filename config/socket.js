var onlineUserDictionary = {}
const app = require("../app")
console.log(app)
console.log(app.server)

const io = require("socket.io")(app.server, {
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

module.exports = {sendNotificationToUser}