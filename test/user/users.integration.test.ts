import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";
import Authenticator from "../../src/security/Authenticate";
import request from "supertest";
import app from "../../src/index";

let userService;
let userController;

describe("User sub-system integration tests:", () => {
    let testUserId;
    const testUserPassword = "paSsW*or^d123";
    const testUserEmail = "testymctestface@testmail.test";
    const testUserName = "Testy";
    const testUserSurname = "Testface";
    const testUserInitials = "TT";
    const testUserSignature = {
        data: "textrepresentingabufferofthesignature"
    }
    let testUserValidationToken;
    let testUserValidationCode;

    beforeAll(async () => {
      await Database.get();
    });

  beforeEach(() => {
    userService = new UserService(new UserRepository());
    userController = new UserController(userService, new Authenticator(userService));
  });

  afterAll(async () => {
    await Database.disconnect();
  });

  describe("User Lifecycle:", () => {

      it("Should create a new user:", async () => {

        //Create new user if it doesn't exist
        //Check if user exists
        //Delete User if it exists:
        let getResponse;
        try {
            getResponse = await userService.getUserByEmail(testUserEmail);
        }catch(err){

        }
        if(getResponse){
          const deleteRequest = {
            params: {
              id: getResponse._id
            }
          } as unknown as Request;

          const deletedUser = await userService.deleteUser(deleteRequest);
          expect(deletedUser.email).toBe("testymctestface@testmail.test");
        }

        //const currentDate = Date.now();
        const mockPostRequest = {
          body: {
            name: testUserName,
            surname: testUserSurname,
            initials: testUserInitials,
            email: testUserEmail,
            password: testUserPassword
          },
          files: {
            signature: testUserSignature
          }
        } as unknown as Request;

        const createdUser = await userController.registerUserRoute(mockPostRequest);
        expect(createdUser.name).toBe(testUserName);
        expect(createdUser.surname).toBe(testUserSurname);
        expect(createdUser.initials).toBe(testUserInitials);
        expect(createdUser.email).toBe(testUserEmail);
        testUserId = createdUser._id;
        testUserValidationCode = createdUser.validateCode;
      });

      it("Should verify the user", async () => {
          const verifyRequest = {
              query: {
                  email: testUserEmail,
                  verificationCode: testUserValidationCode
              },
          } as unknown as Request;

          await userController.verifyUserRoute(verifyRequest);
          //check that user has been updated:
          const user = await userService.getUserByEmail(testUserEmail);
          expect(user.validated).toBe(true);
      });

      it("Should login a user", async () => {
          const loginRequest = {
              body: {
                  email: testUserEmail,
                  password: testUserPassword
              },
          } as unknown as Request;
          testUserValidationToken = await userController.loginUserRoute(loginRequest);
          expect(testUserValidationToken).toBeDefined();
      });

      it("Should Authenticate the User", async () => {
          request(app)
              .post('/api/users/authenticate')
              .set('Authorization', 'Bearer ' + testUserValidationToken)
              .expect('Content-Type', /json/)
              .expect(200);
      })
    });
});
