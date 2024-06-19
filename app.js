require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoute = require('./routes/userRoute');
const bodyParser = require('body-parser');

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

app.get('/', (req, res) => {
    res.send('<h1>WELCOME TO MY HOME PAGE</h1>');
})

app.use('/', userRoute);

app.listen(PORT, ()=>{
    console.log(`My server running at http://localhost:${PORT}`);
});