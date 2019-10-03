const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const index = require("./routes/index");
const chat = require("./models/chat");

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(cors());
app.use(index);

io.origins(['https://pamo18.me:443']);

let conversation = [];
const users = [];
let count = 0;

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('update users', function (username) {
        if (!users.includes(username)) {
            users.push(username);
        }
        console.log("Current users are:\n" + users);
        io.emit('update users', {
            all: users,
            new: username,
            left: null
        });
    });

    socket.on('chat message', function (message) {
        count ++;
        let d = new Date().toUTCString();

        conversation.push({
            count: count,
            timestamp: d,
            user: message.user,
            text: message.text
        });
        io.emit('chat message', conversation);
    });

    socket.on('restore conversation', function () {
        io.emit('restore conversation', conversation);
    });

    socket.on('clear conversation', function () {
        conversation = [];
        io.emit('clear conversation', conversation);
    });

    socket.on('log off', function (user) {
        console.log(user + " disconnected");
        let index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        };
        io.emit('update users', {
            all: users,
            new: null,
            left: user
        });
    });
});

server.listen(8334);
