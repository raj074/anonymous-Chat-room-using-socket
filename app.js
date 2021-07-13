
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));

io.on('connection', socket =>{
    
    socket.on('joinRoom', ({username,room}) =>{

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message',formatMessage('ChatRoom BOT','welcome to ChatRoom') );

        socket.broadcast.to(user.room).emit('message',formatMessage('ChatRoom BOT',`${user.username} has joined the room`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });    
    });


    socket.on("chatMessage", (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username,msg));
    });

    socket.on('disconnect',() =>{

        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message", formatMessage("ChatRoom BOT", `${user.username} has left the room`));

            io.to(user.room).emit("roomUsers", {
              room: user.room,
              users: getRoomUsers(user.room),
            });
        }

    });
})





const PORT = process.env.PORT || 3000;

server.listen(PORT,() => console.log(`listening on ${PORT}`));