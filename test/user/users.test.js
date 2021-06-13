const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../src/index");
const mongoose = require("mongoose");

chai.use(chaiHttp);
chai.should();

describe("Users", () => {
    describe("GET /api/users/:id", () => {
        //Test to get single user:
        it("should get one user by id", (done) => {
            const id = "60b89ade8d0127f52f8fa6cd";
            chai.request(app)
                .get("/api/users/" + id)
                .end( (err,res) => {
                    res.should.have.status(200);
                    mongoose.disconnect();
                    done();
                });
        })
    });
});