const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
    doc_name: { type: String, required: true},
    mimetype: { type: String, required: true },
    encoding: {type: String, required: true},
    size: {type: Number, required: true},
});

module.exports = mongoose.model('Document', documentSchema);