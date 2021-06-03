const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
    doc_name: { type: String, required: true},
    type: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Document', documentSchema);