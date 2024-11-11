const express = require('express');
const app = express();
const { connectToDB } = require('./src/db/index');
const userRouteAuth = require('./src/router/user-router');
const dotenv = require('dotenv').config();

app.use(express.json());
app.use('/api/v1', userRouteAuth);



app.listen(process.env.PORT_NUM, () => {
    console.log('connected to server. Server running!');
    connectToDB();
    console.log(`http://localhost:${process.env.PORT_NUM}`);
})