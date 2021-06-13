const express = require("express");
const Doc = require("../../schemas/document");
const router = express.Router();
const document_server = require('../../services/document_server')


/**
 * This function is used to retrieve a document from the AWS server using the metadata about a workspace stored in the metadata
 * database. It expects to receive a field 'key' which corresponds to a Workflow id. For now it just returns the document
 * specified by the name field that is in the AWS server.
 * TODO: implement the process of storing document workflow id's and such so that this function can be completed.
 */
router.post('/retrieve/', async (req, res) => {
    //for now we will just take in the document key/name is the key but in future we must search for the path
    //to this document (using the workflow id as the filename in the bucket)
    console.log(req.body)
    const file = await document_server.downloadFile(req.body.key);
    console.log(file);

    file.pipe(res); //This is kinda funny but it does work!!! (ask Tim to show you on Postman)
});

/**
 * This path is a post path that is used to upload a document to the AWS server as well as store the metadata of the file
 * in the Mongoose database. This post request expects a file as well as a 'description' field.
 * TODO: decide what all the metadata we want to store is.
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