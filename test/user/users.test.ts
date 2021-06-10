// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const app = require("../../src");
// const mongoose = require("mongoose");
//
// chai.use(chaiHttp);
// chai.should();
//
// describe("Users", () => {
//     describe("GET /api/users/:id", () => {
//         //Test to get single user:
//         it("should get one user by id", (done) => {
//             const id = "60b89ade8d0127f52f8fa6cd";
//             chai.request(app)
//                 .get("/api/users/" + id)
//                 .end( (err,res) => {
//                     res.should.have.status(200);
//                     mongoose.disconnect();
//                     done();
//                 });
//         })
//     });
// });
//
// const test_users = [
//     {
//         _id: "60b89ade8d0127f52f8fa6cd",
//         name: "John",
//         surname: "Cena",
//         initials: "J,C",
//         email: "youcantseeme@nowhere.com",
//         password: "1234",
//         phone: "1234567890",
//         validated: false,
//         tokenDate: Date.now()
//     },
//     {
//         _id: "20b89ade8d4129f52f8fa6fd",
//         name: "Nhoj",
//         surname: "Anec",
//         initials: "N,A",
//         email: "emeestnacuoy@erehwon.com",
//         password: "4321",
//         phone: "0987654321",
//         validated: false,
//         tokenDate: Date.now()
//     }
// ]