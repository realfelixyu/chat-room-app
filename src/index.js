const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
//socket io expects to called with http server
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

//path to use to render UI i think
app.use(express.static(publicDirPath))

const welcomeMsg = 'Welcome to the web server, you\'re connected'

//whenver something connects to server
io.on('connection', (socket) => {
    //broadcasts message to all socket connections except for this user

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({ id: socket.id, ...options})
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message', generateMessage("Admin", welcomeMsg))
        //user.room because we are trimming username
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    //disconnect is built in
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (locationObj, callback) => {
        const user = getUser(socket.id)
        io.emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${locationObj.latitude},${locationObj.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on ' + port)
})
