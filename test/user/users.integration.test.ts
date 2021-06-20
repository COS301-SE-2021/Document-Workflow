import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";

let userService;
let userController;
describe("User integration tests", () => {

  beforeAll(async () => {
      await Database.get();
  });

  beforeEach(() => {
    userService = new UserService(new UserRepository());
    userController = new UserController(userService);
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
          const deleteRequest = {
            params: {
              id: getResponse._id
            }
          } as unknown as Request;

          const deletedUser = await userController.deleteUserRoute(deleteRequest);
          expect(deletedUser.email).toBe("testymctestface@testmail.test");
        }

        //const currentDate = Date.now();
        const mockPostRequest = {
          body: {
            name: "Testy",
            surname: "TestFace",
            initials: "TT",
            email: "testymctestface@testmail.test",
            password: "paSsW*or^d1234"
          },
          files: {
            signature: {
              data: "somedataofasignaturelul"
            }
          }
        } as unknown as Request;

        const postResponse = await userController.registerUserRoute(mockPostRequest);
        console.log(postResponse);
      });
    });
});
