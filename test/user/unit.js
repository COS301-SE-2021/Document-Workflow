const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const users = require("../../src/api/routes/users");
const app = require("../../src/index");

chai.use(chaiHttp);
chai.should();

describe("Users", () => {
    describe("GET /", () => {
        it("should get all users", (done) => {
            chai.request(app)
                .get('/')
                .end((err,res) => {
                    res.should.have.status()
                })
        });
    });
});