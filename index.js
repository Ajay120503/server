const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 4500;

const users = [{}];

app.use(cors());

app.get('/', (req, res) => {
    res.send("server is working");
})

const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {

    socket.on("joined", ({ user }) => {
        users[socket.id] = user;
        socket.broadcast.emit("userJoined", { user: "Admin", message: `${users[socket.id]} has joined` });
        socket.emit("welcome", { user: "Admin", message: `Welcome in chat group, ${users[socket.id]}` });
    })

    socket.on("message", ({ message, id }) => {
        io.emit("sendMessage", { user: users[id], message, id });
    })

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            socket.broadcast.emit("leave", { user: "Admin", message: `${users[socket.id]} has left` });
            delete users[socket.id];
        }
    })
})

server.listen(port, () => {
    console.log(`working http://localhost:${port}`);
})