const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
    origin: "*"
}))

const server = app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
)

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket"]
})

let socketsConnected = new Set()

io.on('connection', (socket) => {
    console.log(`🟢 Connected | ${socket.id} | Transport: ${socket.conn.transport.name}`)

    socket.conn.on("upgrade", () => {
        console.log(`🔼 Transport upgraded: ${socket.conn.transport.name}`)
    })


    socketsConnected.add(socket.id)
    io.emit('clients-total', socketsConnected.size)

    socket.on('disconnect', () => {
        console.log(`🔴 Client disconnected | Socket ID: ${socket.id}`)
        socketsConnected.delete(socket.id)
        io.emit('clients-total', socketsConnected.size)
    })

    socket.on('message', (data) => {
        socket.broadcast.emit('chat-message', data)
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })
})
