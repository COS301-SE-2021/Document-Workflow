import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";
import Authentication from "../../src/auth/Authentication";
import * as supertest from "supertest";

let userService;
let userController;
describe("User integration tests", () => {

  beforeAll(async () => {
      await Database.get();
  });

  beforeEach(() => {
    userService = new UserService(new UserRepository());
    userController = new UserController(userService, new Authentication(userService));
  });

  afterAll(async () => {
    await Database.disconnect();
  });

  describe("User Lifecycle:", () => {

      test("Create new user:", async () => {

        const findByEmailRequest = {
          params: {
            email: "testymctestface@testmail.test"
          },
        } as unknown as Request;

        const getResponse = await userController.getUserByEmailRoute(findByEmailRequest);
        if(getResponse){
          //delete user
          const deleteRequest = {
            params: {
              id: getResponse._id
            }
          } as unknown as Request;

          await userController.deleteUserRoute(deleteRequest);

        }

        const currentDate = Date.now();
        const mockPostRequest = {
          body: {
            name: "Testy",
            surname: "Testson",
            initials: "TT",
            email: "testymctestface@testmail.test",
            password: "paSsW*or^d1234",
            validated: false,
            tokenDate: currentDate,
            signature: ""
          },
        } as unknown as Request;

        const postResponse = await userController.registerUserRoute(mockPostRequest);
        console.log(postResponse);


      });
    });
});
