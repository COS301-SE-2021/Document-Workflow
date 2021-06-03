const express = require("express");
const Doc = require("../../schemas/document");
const mongoose = require('mongoose')
const router = express.Router();

router.post('', (req, res) => {

    if(!req.files || Object.keys(req.files).length === 0)
    {
        res.status(400).json({
            message: "No files sent"
        });
    }

    const file = req.files.file

    const document = new Doc({
        doc_name: file.name,
        mimetype: file.mimetype,
        encoding: file.encoding,
        size: file.size,

    });

    document.save()
        .then((doc)=>{
            console.log(doc);
            res.status(200).json({
                message: "Document added successfully",
                docId: doc._id
            });
        })
        .catch((msg)=>{
            res.status(500).json({
                message: msg
            });
        });
});

module.exports = router;