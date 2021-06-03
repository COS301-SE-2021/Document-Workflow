const express = require("express");
const Doc = require("../../models/document");
const mongoose = require('mongoose')
const router = express.Router();

router.post('', (req, res) => {

    const document = new Doc({
        doc_name: req.body.documentName,
        type: req.body.type,
        description: req.body.description
    });
    console.log(document);
    document.save()
        .then((doc)=>{
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