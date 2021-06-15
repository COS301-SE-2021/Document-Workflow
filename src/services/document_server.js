const S3 = require('aws-sdk/clients/s3');
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyID = process.env.AWS_SECRET_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKeyID,
    secretAccessKey
});

/**
 * This function handles the uploading of a file to be stored on the file server
 * (In this cae, Amazon Web Services S3 is being used).
 * @param file: the file object to be stored
 * @returns {Promise<ManagedUpload.SendData>}: the promise from Jeff Bezos himself
 * TODO: once a workflow is created, it will be given its own file in the bucket
 */
function uploadFileToS3(file)
{
    //const fileStream = fs.createReadStream(file.tempFilePath);

    const uploadParams = {
        Bucket: bucketName,
        Body: file.data,
        Key: file.name
    }
    console.log(uploadParams)
    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFileToS3

/**
 * This function handles the process of fetching a stored document from the AWS S3 server so that it can be returned
 * To the end user. The basic idea is that each workflow will get its own folder in which all version's of its document are stored
 * .The key used to fetch the document will be a combination of the workflowID/document name (this key will be stored in
 * the metadata database).
 * @param key
 * @returns {ReadStream}
 */
function downloadFileFromS3(key)
{
    const downloadParams = {
        Key: key,
        Bucket: bucketName
    }
    console.log(downloadParams)
    return s3.getObject(downloadParams).createReadStream()
}
exports.downloadFile = downloadFileFromS3