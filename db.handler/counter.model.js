const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    seq: {
        type: Number,
        required: true,
        default: 0
    }
});


const counterModel = mongoose.model('Counter', counterSchema);
module.exports = counterModel;