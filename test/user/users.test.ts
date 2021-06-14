import sinon from "sinon";
import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";

describe("user unit tests", () => {
    let userService;

    beforeEach(()=>{
        userService = new UserService(new UserRepository());
    });

    describe("/GET" ,()=>{
        describe("api/users" ,()=> {
            test("Zero Users Found: ", async () => {
                sinon.stub(userService, "getUsers").returns([]);
                const userController = new UserController(userService);
                const users = await userController.getUsersRoute();
                expect(users.length).toBe(0);
            });

            test("One User Found: ", async () => {
                const currentDate = Date.now();
                sinon.stub(userService, "getUsers").returns([{
                    //_id: "123456789",
                    name: "Joey",
                    surname: "Cooper",
                    initials: "JC",
                    email: "joey@hotmail.gov",
                    password: "password1234",
                    validated: false,
                    tokenDate: currentDate
                }]);
                const userController = new UserController(userService);
                userController.getUsersRoute()
                    .then((users) => {
                        expect(users.length).toBe(1);
                        //expect(users[0]._id).toBe("123456789");
                        expect(users[0].name).toBe("Joey");
                        expect(users[0].surname).toBe("Cooper");
                        expect(users[0].initials).toBe("JC");
                        expect(users[0].email).toBe("joey@hotmail.gov");
                        expect(users[0].password).toBe("password1234");
                        expect(users[0].validated).toBe(false);
                        expect(users[0].tokenDate).toBe(currentDate);
                    })
                    .catch(err => {
                        throw err;
                    });
            });
        });

        describe("api/users/:id" ,()=> {
            test("Zero Users Found by id", async () => {
            });

            test("One User Found by id", async () => {
            });

            test("Something is wrong with URI", async () => {
            });
        });
    });

    describe("api/users POST", ()=>{

    })

    describe("api/users PUT", ()=>{

    })

    describe("api/users DELETE", ()=>{

    })
});