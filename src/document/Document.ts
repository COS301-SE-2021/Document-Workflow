const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
    doc_name: { type: String, required: true},
    mimetype: { type: String, required: true },
    encoding: {type: String, required: true},
    size: {type: Number, required: true},
});

const model = mongoose.model("Document", documentSchema);
export default model;