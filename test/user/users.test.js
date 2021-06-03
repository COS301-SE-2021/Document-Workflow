const chai = require("chai");
const chaiHttp = require("chai-http");
const mockingoose = require("mockingoose");
const users = require("../../src/api/routes/users");
const userModel = require("../../src/schemas/user");
const app = require("../../src/index");
const testUsers = require("../dummy-data/test_users");

chai.use(chaiHttp);
chai.should();

mockingoose(userModel).toReturn(testUsers[0], '')

describe("Users", () => {
    describe("GET /", () => {
        //Test to get single user:
        it("should get one user by id", (done) => {
            const id = "60b89ade8d0127f52f8fa6cd";
            chai.request(app)
                .get(`/${id}`)
                .end( (err,res) => {
                    console.log(res);
                    res.should.have.status(200);
                    done();
                })
        })
    });
});