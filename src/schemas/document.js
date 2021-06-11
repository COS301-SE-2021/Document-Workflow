const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
    doc_name: { type: String, required: true},
    doc_type: {type: String },                  //This field will tell us whether the document is a timesheet, something else etc
    mimetype: { type: String, required: true },
    encoding: {type: String, required: true},
    size: {type: Number, required: true},
});

module.exports = mongoose.model('Document', documentSchema);