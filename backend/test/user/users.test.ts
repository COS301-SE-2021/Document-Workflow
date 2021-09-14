import sinon from "sinon";
import UserRepository from "../../src/user/UserRepository";
import UserService from "../../src/user/UserService";
import UserController from "../../src/user/UserController";
import Authenticator from "../../src/security/Authenticate";
//import jwt from 'jsonwebtoken';
import { AuthenticationError, RequestError } from "../../src/error/Error";
import { IUser } from "../../src/user/IUser";
import { Schema, Types } from "mongoose";
// @ts-ignore
import jwt from "jsonwebtoken";

describe("user unit tests", () => {
  let userRepository;
  let userService;
  let userController;

  beforeEach(() => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);
    userController = new UserController(
      userService,
      new Authenticator()
    );
  });

  it("Should return one user", async () => {
    const currentDate = Date.now();
    sinon.stub(userRepository, "findUser").returns({
      _id: "60cd9993b5331c3798e8045f",
      name: "Testy",
      surname: "Testerson",
      initials: "TT",
      email: "testy@test.gov",
      password: "$2a$10$jpqmyXtZ1wF5UEX2Mmu0d.iweFGJXlFfU2jar.5.Cr3bQYuVVvdh2",
      signature: "signaturetext",
      validated: false,
      validateCode:
        "db0ecc907a401a027adcd18113a359c1b3341a9a5cb9eedd4478d97942bef065c9cce0d255199cc8846697a65962404e9da27c3ac8e598dd568ec1db85e23c2e",
      tokens: "",
      tokenDate: currentDate,
      owned_workflows: [
        "60cdaaeeb3fff625d8b1aabd",
        "60cdab627b355b1d5831001f",
        "60cdd73869769a1c1469fa31",
      ],
      workflows: [
        "60cdd73869769a1c1469fa31",
        "60cdd73869769a1c1469fa31",
        "60cdd73869769a1c1469fa31",
      ],
    });

    userService
      .getUserByEmail("joey@hotmail.gov")
      .then((user) => {
        expect(user.name).toBe("Testy");
        expect(user.surname).toBe("Testerson");
        expect(user.initials).toBe("TT");
        expect(user.email).toBe("testy@test.gov");
        expect(user.validated).toBe(false);
        expect(user.tokenDate).toBe(currentDate);
      })
  });
  it("Should gracefully handle faults in request object", async () => {
    const request = {
      body: {
        eemail: "unittest@test.com",
        paaassword: "AgR3aTP4SsW0rd"
      },
    } as any as Request;

    await expect(userController.loginUserRoute(request)).rejects.toThrow(
        RequestError
    );
  });
  it("Should encode user email and id as JWT", async () => {
    const hashedPassword: string =
      userService.getHashedPassword("AgR3aTP4SsW0rd");

    const response = {
      _id: new Types.ObjectId("0x012345678911"),
      password: hashedPassword,
      validated: true,
      email: "unittest@test.com",
    } as any as IUser;

    sinon.stub(userRepository, "findUser").returns(response);
    try {
      const token = await userService.loginUser("unittest@test.com", "AgR3aTP4SsW0rd");
      let decoded: any = jwt.verify(token, process.env.SECRET);
      expect(decoded.id).toBe("1234567890");
      expect(decoded.email).toBe("unittest@test.com");
    } catch (err) {
      throw err;
    }
  });
  it("Should not login user with incorrect password", async () => {
    //fake req.body.email and req.body.password:
    const request = {
        email: "unittest@test.com",
        password: "AgR3aTP4SsW0rd"
    }

    const hashedPassword: string = userService.getHashedPassword(
      "AgR3aTP4SsW0rd212311"
    );

    const response = {
      password: hashedPassword,
      _id: "1234567890",
      validated: true,
      email: "unittest@test.com",
    } as any as IUser;

    sinon.stub(userRepository, "findUser").returns(response);

    await expect(userService.loginUser(request.email, request.password)).rejects.toThrow(
      AuthenticationError
    );
  });

  it("Should replace mongo special characters with escaped versions", async () => {

  })
});
