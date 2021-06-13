const express = require("express");
const Doc = require("../../schemas/document");
const router = express.Router();
const document_server = require('../../services/document_server')

router.post('/retrieve/', async (req, res) => {
    //for now we will just take in the document key/name is the key but in future we must search for the path
    //to this document (using the workflow id as the filename in the bucket)
    console.log(req.body)
    const file = await document_server.downloadFile(req.body.key);
    console.log(file);

    file.pipe(res); //This is kinda funny but it does work!!! (ask Tim to show you on Postman)
});

/**
 * TODO: save the meta data about the file in the database.
 */
router.post('', async (req, res) => {

    console.log(req.files)
    console.log("Sending file to AWS");
    try {
        const result = await document_server.uploadFile(req.files.document)
        console.log(result)
    }
    catch(e)
    {
        console.log(e)
    }

    res.status(200).json({
        message: "Ree"
    });
    /*
    if(!req.files || Object.keys(req.files).length === 0)
    {
        res.status(400).json({
            message: "No files sent"
        });
    }
    const file = req.files.document

    const document = new Doc({
        doc_name: file.name,
        mimetype: file.mimetype,
        encoding: file.encoding,
        size: file.size,
    });

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
        */
});



module.exports = router;