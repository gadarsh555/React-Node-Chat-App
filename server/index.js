const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {addUser,removeUser,getUser,getUsersInRoom } = require('./users');
const app = express();

const server = http.createServer(app);
const io = socketio(server);

const router = require('./router');
const PORT = process.env.Port || 5000;

io.on('connection',(socket) => {
    console.log("We have a new connection!!!");
    socket.on('join',({name,room},callback) => {
        const {user,error} = addUser({id:socket.id,name,room});
        if(error) return callback(error);

        socket.emit('message',{user:'admin',text:`${user.name},Welcome to the Room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined.`})
        socket.join(user.room);

        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)});
        callback();
    });

    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id);
         if(user){
            io.to(user.room).emit('message',{user:user.name,text:message});
         }
        
        callback();
    })

    socket.on('disconnect',() => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left.`})
            io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)});
        }
    });
});
/* app.use(cors()); */
app.use(router);
server.listen(PORT,() => console.log("Server is running on : ",PORT))

