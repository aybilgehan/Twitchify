const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },

    email: {
        type: String,
        require: true,
        unique: true
    },

    password: {
        type: String,
        require: true
    },

    trackID: {
        type: String
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;