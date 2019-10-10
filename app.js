/**
 * Chat server
 */
"use strict";

const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const index = require("./routes/index");
const chat = require("./models/chat");

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(cors());
app.use("/", index);

io.origins(['https://pamo18.me:443']);

let conversation = [];
const users = [];
let count = 0;

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('user joined', function (username) {
        if (!users.includes(username)) {
            users.push(username);
        }
        console.log("Current users are:\n" + users);
        io.emit('current users', {
            all: users,
            new: username,
            left: null
        });
    });

    socket.on('user left', function (user) {
        console.log(user + " left the chat");
        let index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        };
        io.emit('current users', {
            all: users,
            new: null,
            left: user
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
        io.emit('new message', conversation);
    });

    socket.on('resume conversation', function () {
        io.emit('current conversation', conversation);
    });

    socket.on('clear conversation', function () {
        conversation = [];
        count = 0;
        io.emit('new conversation', conversation);
    });

    socket.on('get conversations', function () {
        chat.show()
        .then(res => io.emit('show conversations', res))
        .catch(err => console.log(err));
    });

    socket.on('save conversation', function (user) {
        chat.save(user, conversation)
        .then(function () {
            chat.show()
            .then(res => io.emit('show conversations', res))
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });

    socket.on('restore conversation', function (timestamp) {
        chat.restore(timestamp)
        .then(function (res) {
            conversation = res[0].conversation
            io.emit('resume conversation');
        })
        .catch(err => console.log(err));
    });

    socket.on('delete conversation', function (timestamp) {
        chat.delete(timestamp)
        .then(function () {
            chat.show()
            .then(res => io.emit('show conversations', res))
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
});

server.listen(8334);
