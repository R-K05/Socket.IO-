const express = require("express")
const app = express()

const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: {
      // 解决客户端跨域 8080客户端运行端口
        origin: ["http://localhost:8080"]
      }
});

const userList = []

const onlineUsers = {}

io.on("connection", (socket) => {
  const username = socket.handshake.query.username
  if(!username) return

  const userInfo = userList.find(user => username === user.username)
  if(userInfo){
    userInfo.id = socket.id
  }else{
    userList.push({
      username,
      id:socket.id
    })
  }

  io.emit("online",{
    userList
  })

  socket.on('send',({formUsername,targetId,msg}) =>{
    
    const toUser = userList.find(user => user.id === targetId)
    console.log(toUser);
    
    
    // 发送客户端
    io.to(targetId).emit('receive', { 
      fromUsername: formUsername,
      toUsername:toUser.username,
      msg,
      dataTime:new Date().getTime()
  });
  })
  
});

app.listen(8000,() =>{
    console.log("ok");
    
})