const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../src/index");
const mongoose = require("mongoose");
const User = require("../../src/schemas/user");

chai.use(chaiHttp);
chai.should();

describe("Users", () => {

    beforeAll(()=> {
        jest.setTimeout(5000);
    });

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
    /*
    describe("POST /api/users", () =>{

        it("Should successfully create a new user if the given email is unique", (done) => {
            const user = new User({
                name:  "Test",
                surname: "User",
                initials: "TU",
                email: "unique_email@address.com",
                password: "p!@asdD3$sd"
            });
            chai.request(app)
                .post("/api/users" )
                .set('Content-Type', 'application/json; charset=UTF-8')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    mongoose.disconnect();
                    done();
                })
        });
    }); */

    //afterAll(() =>{
    //    mongoose.connection.close()
    //});
});