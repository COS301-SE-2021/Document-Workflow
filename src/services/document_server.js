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