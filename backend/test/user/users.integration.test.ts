import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";
import Authenticator from "../../src/security/Authenticate";
import request from "supertest";
import app from "../../src";

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

    const contactUserPassword = "An0tHeRgReAtpaSsW*or^d123";
    const contactUserEmail = "jigglyjelly@test.test";
    const contactUserName = "Jiggly";
    const contactUserSurname = "Jelly";
    const contactUserInitials = "JJ";
    const contactUserSignature = {
        data: "textrepresentingabufferofthesignature"
    }

    beforeAll(async () => {
      await Database.get();
    });

  beforeEach(() => {
    userService = new UserService(new UserRepository());
    userController = new UserController(userService, new Authenticator());
  });

  afterAll(async () => {
    await Database.disconnect();
  });

  describe("User Lifecycle:", () => {

      it("Should create user1:", async () => {

        //Create new user if it doesn't exist
        //Check if user exists
        //Delete User if it exists:

        const getResponse = await userService.getUserByEmail(testUserEmail);

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
              password: testUserPassword,
              confirmPassword: testUserPassword
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

      it("Should verify user1", async () => {
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

      it("Should login user1", async () => {
          const loginRequest = {
              body: {
                  email: testUserEmail,
                  password: testUserPassword
              },
          } as unknown as Request;
          testUserValidationToken = await userController.loginUserRoute(loginRequest);
          expect(testUserValidationToken).toBeDefined();
      });

      it("Should authenticate user1", async () => {
          request(app)
              .post('/api/users/authenticate')
              .set('Authorization', 'Bearer ' + testUserValidationToken)
              .expect('Content-Type', /json/)
              .expect(200);
      })

      it("Should invalidate user1's access token", async () => {
          request(app)
              .delete('/api/users/logout')
              .set('Authorization', 'Bearer ' + testUserValidationToken)
              .expect('Content-Type', /json/)
              .expect(200);
      });

      it("Should fail to authenticate with the previous token", async () => {
          request(app)
              .post('/api/users/authenticate')
              .set('Authorization', 'Bearer ' + testUserValidationToken)
              .expect('Content-Type', /json/)
              .expect(401)
      });

    });

  describe("User Contacts Lifecycle:", () => {

      /*it("Should create a user2")

      it("Should verify user2")

      it("Should login user1")

      it("Should send a contact request to user2")*/


  });
});
