const express = require("express");
const Doc = require("../../schemas/user");
const router = express.Router();

router.post('', (req, res) => {
    console.log(req.body);
    const document = new Doc({
        userId: req.body.userID,
        doc_name: req.body.documentName,
        location: req.body.documentLocation,
        status: req.body.status,
        type: req.body.type,
        description: req.body.description
    });
    console.log(document);
    document.save()
        .then((doc)=>{
            res.status(200).json({
                message: "User added successfully",
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