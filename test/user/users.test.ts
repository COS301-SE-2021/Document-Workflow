import sinon from "sinon";
import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import { UserDoc } from "../../src/user/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AuthenticationError from "../../src/error/AuthenticationError";
import WorkFlowRepository from "../../src/workflow/WorkflowRepository";
dotenv.config();

describe("user unit tests", () => {
    let userService;
    let userController;
    let userRepository;

    beforeEach(() => {
        userRepository = new UserRepository();
        userService = new UserService(userRepository, new WorkFlowRepository());
        userController = new UserController(userService);
    });

    describe("GET api/users" ,() => {
        test("Zero Users Found: ", async () => {
            sinon.stub(userService, "getAllUsers").returns([]);
            const users = await userController.getUsersRoute();
            expect(users.length).toBe(0);
        });

        test("One User Found: ", async () => {
            const currentDate = Date.now();
            sinon.stub(userService, "getUser").returns([{
                _id: "60cd9993b5331c3798e8045f",
                name: "Testy",
                surname: "Testerson",
                initials: "TT",
                email: "testy@test.gov",
                password: "$2a$10$jpqmyXtZ1wF5UEX2Mmu0d.iweFGJXlFfU2jar.5.Cr3bQYuVVvdh2",
                signature: "signaturetext",
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

        describe("/:id" ,() => {
            test("Zero Users Found by id", async () => {

            });

            test("One User Found by id", async () => {
            });

            test("Something is wrong with URI", async () => {
            });
        });

        describe("/verify", () => {});
    });

    describe("POST api/users", () => {
        describe("/login", () => {
            it("Should return a JWT token", async () => {
                //fake req.body.email and req.body.password:
                const request = {
                    body: {
                        email: "unittest@test.com",
                        password: "AgR3aTP4SsW0rd"
                    }
                } as any as Request;

                const hashedPassword: string = userService.getHashedPassword("AgR3aTP4SsW0rd");

                const response = {
                    password: hashedPassword,
                    _id: "1234567890",
                    validated: true,
                    email: "unittest@test.com"

                } as any as UserDoc;

                sinon.stub(userRepository, "getUser").returns(response);
                try{
                    const token = await userService.loginUser(request);
                    const decoded = jwt.verify(token, process.env.SECRET);
                    expect(decoded.id).toBe("1234567890");
                    expect(decoded.email).toBe("unittest@test.com");
                }
                catch(err){
                    throw err;
                }
            });
            it("Should throw AuthenticationError", async () => {
                //fake req.body.email and req.body.password:
                const request = {
                    body: {
                        email: "unittest@test.com",
                        password: "AgR3aTP4SsW0rd"
                    }
                } as any as Request;

                const hashedPassword: string = userService.getHashedPassword("AgR3aTP4SsW0rd212311");

                const response = {
                    password: hashedPassword,
                    _id: "1234567890",
                    validated: true,
                    email: "unittest@test.com"

                } as any as UserDoc;

                sinon.stub(userRepository, "getUser").returns(response);

                await expect(userService.loginUser(request)).rejects.toThrow(AuthenticationError);
            });

        });
    })
});