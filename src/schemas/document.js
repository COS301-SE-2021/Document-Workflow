const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
    userId: { type: String, required: true},
    doc_name: { type: String, required: true},
    location: { type: String, required: true},
    status: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Document', documentSchema);