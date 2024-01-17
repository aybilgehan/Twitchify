const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
    userId: Number,
    record: String,
});

module.exports = mongoose.model('record', recordSchema);