require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const userRoute = require('./routes/userRoute');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to mongodb');
});
db.on('error', (err) => {
    console.log(`error connecting to mongodb ${err}`);
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', userRoute);

app.get('/', (req, res) => {
    res.send('<h1>WELCOME TO MY HOME PAGE</h1>');
});

io.on('connection', (socket) => {
    console.log('Client connected!');

    socket.on('join', (userId) => {
        app.set('socket', { io, userId });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected!');
    });
});

server.listen(PORT, () => {
    console.log(`My server running at http://localhost:${PORT}`);
});
