const chai = require("chai");
const chaiHttp = require("chai-http");
const mockingoose = require("mockingoose");
const documents = require("../../src/api/routes/documents");
const documentModel = require("../../src/schemas/document");
const app = require("../../src/index");
const testDocs = require("../dummy-data/documents");

chai.use(chaiHttp);
chai.should();

mockingoose(documentModel).toReturn(testDocs[0], '');

describe("Documents", () => {
    describe("POST /", () => {
        //Test to get single user:
        it("should post one document to the database", (done) => {
            chai.request(app)
                .post(``, ()=>{

                })
                .end( (err,res) => {
                    console.log(res);
                    res.should.have.status(200);
                    done();
                })
        })
    });
});