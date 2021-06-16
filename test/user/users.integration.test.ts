import UserService from "../../src/user/UserService";
import UserRepository from "../../src/user/UserRepository";
import UserController from "../../src/user/UserController";
import Database from "../../src/Database";

let userService;
let userController;
describe("user integration tests", () => {
  // Database.get();
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

  describe("/POST", () => {
    describe("/api/users", () => {
      test("One User inserted", async () => {
        const currentDate = Date.now();
        const mockPostRequest = {
          body: {
            name: "Joey2",
            surname: "Cooper2",
            initials: "JC",
            email: "joey@hotmail.gov",
            password: "paSsW*or^d1234",
            validated: false,
            tokenDate: currentDate,
          },
        } as unknown as Request;

        const postResponse = await userController.postUserRoute(mockPostRequest);

        const mockGetRequest = {
          params: {
            id: postResponse._id,
          },
        } as unknown as Request;

        const getResponse = await userController.getUserRoute(mockGetRequest);
      });
    });
  });
});
