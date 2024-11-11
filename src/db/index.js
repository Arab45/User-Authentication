const mongoose = require('mongoose');

const connectToDB = () => {
    mongoose.connect(process.env.DB_URI).then(() => {
        console.info("connected");
    }).catch((error) => {
        console.log(`Error ${error}`);
        console.info("disconnected from mongodb")
    });
};


mongoose.connection.on('connected', () => {
    console.log("App connect to DB");
});

mongoose.connection.on('disconnected', () => {
    console.log("App disconnected from DB")
});



module.exports = {connectToDB}