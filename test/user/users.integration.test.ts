import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";
import WorkFlowRepository from "../../src/workflow/WorkflowRepository";
import Authenticator from "../../src/security/Authenticate";

let userService;
let userController;
describe("User integration tests", () => {

  beforeAll(async () => {
      await Database.get();
  });

  beforeEach(() => {
    userService = new UserService(new UserRepository(), new WorkFlowRepository());
    userController = new UserController(userService, new Authenticator(userService));
  });

  afterAll(async () => {
    await Database.disconnect();
  });

  describe("User Lifecycle:", () => {

      it("Should create a new user:", async () => {

        //Create new user if it doesn't exist
        //Check if user exists
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

        // const postResponse = await userController.registerUserRoute(mockPostRequest);
        await userController.registerUserRoute(mockPostRequest);
        //console.log(postResponse);
      });

      it("Should delete a user", () => {

      });

      it("Should edit a user", () => {

      });

      it("Should add friends to a user", () => {

      });

      it("Should remove a friend from a user", () => {

      });


      //Negative tests
      it("Should throw Authentication Error", () => {

      });




    });
});
