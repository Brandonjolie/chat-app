const express = require('express')
const http = require('http')
const path = require('path')
const portNum = process.env.PORT
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed bitch ')
        }
        if (!user.room) return
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        console.log('Disconnect')
        const user = removeUser(socket.id)
        if (user)
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has disconnected`))
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        if (!user.room) return
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })
        if (error) {
            return callback(error)
        } else {
            socket.join(user.room)
            // io.to.emit, socket.broadcast.to.emit
            socket.emit('message', generateMessage('Admin', `Welcome to the server`))
            socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        callback()
    })

})


server.listen(portNum, () => {
    console.log(`Server running on ${portNum}`)
})