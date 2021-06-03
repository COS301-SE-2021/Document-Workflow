const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../../src/index");
const fs = require('fs');

chai.use(chaiHttp);
chai.should();

describe("Documents", () => {
    describe("POST /api/documents", () => {
        //Test to get single user:
        it("should insert a document into the db from body content", (done) => {
            const file = {
                name: "someFileOrRather2.pdf",
                mimetype: "pdf",
                encoding: "7bit",
                size: 342463
            }
            chai.request(app)
                .post("/api/documents")
                .set('Content-Type', 'application/x-www-urlencoded')
                .field('Content-Type', 'multipart/form-data')
                .field('fileName', 'someFileOrRather2.pdf')
                .attach('files', '../../documents/someFileOrRather2.pdf')
                .send(file)
                .end( (err,res) => {
                    console.log(res);
                    res.should.have.status(200);
                    mongoose.disconnect();
                    done();
                })
        })
    });
});