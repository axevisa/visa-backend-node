const mongoose = require('mongoose');
require('dotenv').config();

const connectToDb = () => {
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log("Database connected");
    });
};

module.exports = connectToDb;