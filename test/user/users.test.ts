import sinon from "sinon";
import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Authentication from "../../src/auth/Authentication";
import { User, UserDoc, UserProps } from "../../src/user/User";

describe("user unit tests", () => {
    let userService;
    let userController;
    let userRepository;

    beforeEach(() => {
        sinon.mockClear();
        userRepository = new UserRepository();
        userService = new UserService(userRepository);
        userController = new UserController(userService, new Authentication(userService));
    });

    describe("GET api/users" ,() => {
        describe("" ,() => {
            test("Zero Users Found: ", async () => {
                sinon.stub(userService, "getUsers").returns([]);
                const users = await userController.getUsersRoute();
                expect(users.length).toBe(0);
            });

            test("One User Found: ", async () => {
                const currentDate = Date.now();
                sinon.stub(userService, "getUsers").returns([{
                    _id: "60cd9993b5331c3798e8045f",
                    name: "Testy",
                    surname: "Testerson",
                    initials: "TT",
                    email: "testy@test.gov",
                    password: "$2a$10$jpqmyXtZ1wF5UEX2Mmu0d.iweFGJXlFfU2jar.5.Cr3bQYuVVvdh2",
                    signature: new Buffer("Buffer string for signature"),
                    validated: false,
                    validateCode: "db0ecc907a401a027adcd18113a359c1b3341a9a5cb9eedd4478d97942bef065c9cce0d255199cc8846697a65962404e9da27c3ac8e598dd568ec1db85e23c2e",
                    tokens: "",
                    tokenDate: currentDate,
                    owned_workflows: ["60cdaaeeb3fff625d8b1aabd","60cdab627b355b1d5831001f","60cdd73869769a1c1469fa31"],
                    workflows: ["60cdd73869769a1c1469fa31","60cdd73869769a1c1469fa31","60cdd73869769a1c1469fa31"]
                }]);

                userController.getUsersRoute()
                    .then((users) => {
                        expect(users.length).toBe(1);
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

        describe("/:id" ,() => {
            test("Zero Users Found by id", async () => {
            });

            test("One User Found by id", async () => {
            });

            test("Something is wrong with URI", async () => {
            });
        });

        describe("/verify", () => {});

        describe("/verify", () => {});
    });

    describe("POST api/users", () => {
        describe("/login", () => {

            // if(!req.body.email || !req.body.password){
            //     throw new Error("Could not log in");
            // }
            // let user = await this.userRepository.getUser({"email": req.body.email})
            // if(user.validated){
            //     return await this.authenticateUser(req.body.password, user.password, user._id);
            // } else {
            //     throw new AuthenticationError("User must be validated");
            // }

            test("Positive Case:", async () => {
               sinon.stub(userRepository, "")
            });


        });

        describe("/logout", () => {});

        describe("/register", () => {});

    })

    describe("PUT api/users", ()=>{
        describe("/:id", () => {
            test("", async() => {

            });


        });
    })

    describe("DELETE", () => {
        describe("", () => {});

    })
});