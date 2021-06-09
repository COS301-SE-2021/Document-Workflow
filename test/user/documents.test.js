const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../../src/index");

chai.use(chaiHttp);
chai.should();

describe("Documents", () => {
    describe("POST /api/documents", () => {
        it("should insert a document into the db from body content", (done) => {
            chai.request(app)
                .post("/api/documents")
                .set('Content-Type', 'application/pdf')
                .field('name', 'someFileOrRather2.pdf')
                .field('mimetype', 'pdf')
                .field('size', 501414)
                .field('encoding', 'gzip')
                .attach('file', "./test/user/someFileOrRather2.pdf", 'someFileOrRather2.pdf')
                .end( (err,res) => {
                    //console.log(res);
                    res.should.have.status(200);
                    mongoose.disconnect();
                    done();
                })
        })
    });
});