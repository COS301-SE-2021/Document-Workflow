import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";
import Authenticator from "../../src/security/Authenticate";
import request from "supertest";
import app from "../../src";
import { IUser } from "../../src/user/IUser";
import { createTestUser, deleteTestUser, loginTestUser, testUsers, verifyTestUser } from "../testData/test-users";
import { RequestError } from "../../src/error/Error";

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

    const user1 = testUsers.user3;
    const user2 = testUsers.user4;
    let realUser1: IUser;
    let realUser2: IUser;
    let user1Auth;
    let user2Auth;

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

            const getResponse = await userService.getUserByEmail(testUserEmail);

            const deletedUser = await userService.deleteUser(getResponse._id, {
                _id: getResponse._id,
                email: getResponse.email
            });
            expect(deletedUser.email).toBe("testymctestface@testmail.test");

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
        });

        it("Should update user profile", async () => {
            request(app)
                .post('/api/users/updateProfile')
                .set('Authorization', 'Bearer ' + testUserValidationToken)
                .send({
                    name : "Popeye",
                    surname : "Parker",
                    initials : "PP"
                })
                .expect('Content-Type', /json/)
                .expect(200);
        });

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

        it("Should delete, create, verify, login user1", async () => {
            const res = await userService.getUserByEmail(user1.email);
            if(res){const del = await deleteTestUser(res, userService);}
            const user = await createTestUser(user1, userService);
            expect(user.email).toBe(user1.email);
            const verify = await verifyTestUser(user, userService);
            const token = await loginTestUser(user1, userService);
            if(token) user1.authToken = token;
            realUser1 = user;
            user1Auth = {_id: realUser1._id, email: realUser1.email};
        });

        it("Should create,verify,login user2", async () => {
            const res = await userService.getUserByEmail(user2.email);
            if(res){const del = await deleteTestUser(res, userService);}
            const user = await createTestUser(user2, userService);
            expect(user.email).toBe(user2.email);
            const verify = await verifyTestUser(user, userService);
            const token = await loginTestUser(user2, userService);
            if(token) user2.authToken = token;
            realUser2 = user;
            user2Auth = {_id: realUser2._id, email: realUser2.email};
        });




        it("Should send a contact request from user1 to user2", async () => {
            const res = await userService.sendContactRequest(user2.email, user1Auth);
            expect(res).toStrictEqual(realUser2._id);
        });

        it("Should accept contact request from user1", async () => {
            const res = await userService.acceptContactRequest(user1.email, user2Auth);
            expect(res).toStrictEqual(realUser2._id);
        });

        it("Should delete user1 from user2's contacts", async () => {
            const res = await userService.deleteContact(user1.email, user2Auth);
            expect(res).toStrictEqual(realUser1._id);
        });

        it("Should add user1 to user2's blocked list", async () => {
            const res = await userService.blockUser(user1.email, user2Auth);
            expect(res).toStrictEqual(realUser1._id);
        });

        it("Should ignore a contact request from user1", async () => {
            await expect(userService.sendContactRequest(user2.email, user1Auth)).rejects.toThrow(RequestError);
        });

        it("Should unblock user1 from user2", async () => {
            const res = await userService.unblockUser(user1.email, user2Auth);
            expect(res).toStrictEqual(realUser1._id);
        });

        it("Should delete user1 and user2", async () => {
            if(realUser1){
                const del = await deleteTestUser(realUser1, userService);
                expect(del.email).toBe(user1.email);
            }
            if(realUser2){
                const del = await deleteTestUser(realUser2, userService);
                expect(del.email).toBe(user2.email);
            }
        });


    });
});
