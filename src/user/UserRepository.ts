import User, { UserModel } from "./User";
import { Types } from "mongoose";

export default class UserRepository {

    /**
     * @returns Promise<any> The newly created user.
     * @throws Error
     * @param Usr: An object containing all the information to create a new user.
     */
    async postUser(Usr: User): Promise<User> {
        const usr = new UserModel({
            name: Usr.name,
            surname: Usr.surname,
            initials: Usr.initials,
            email: Usr.email,
            password: Usr.password,
            validated: Usr.validated
        });
        try{
            return await usr.save();
        } catch (err) {
            throw err;
        }
    }


    /**
     * @returns Promise<any> A list of the found users.
     * @throws Error If something goes horribly wrong
     * @param filter An object containing the search criteria
     */
    async getUsers(filter): Promise<User[]> {
        try {
            return await UserModel.find(filter);
        } catch (err) {
          throw new Error(err);
        }
    }

    /**
     * @returns Promise<any> The user object after it has been changed
     * @throws Error when the user object is not found
     * @param Usr The user object to be modified
     */
    async putUser(Usr: User): Promise<User> {
            const usr = await UserModel.findOne({id: Usr._id});
            if(usr){
                await Usr.validate();
                return await Usr.save();
            } else {
                throw new Error("Could not update user");
            }
    }

    /**
     * @returns Promise<any> The user object if it was found
     * @throws Error if findOne breaks somehow
     * @param filter An object containing the search criteria
     */
    async getUser(filter): Promise<User> {
        try {
            return await UserModel.findOne(filter);
        } catch(err) {
            throw err;
        }
    }

    /**
     * @returns Promise<any> The deleted user
     * @throws Error If the user could not be deleted
     * @param id The id of the user that is to be deleted
     */
    async deleteUser(id: Types._ObjectId): Promise<User> {
        try{
            return await UserModel.findOneAndDelete({_id: id});
        } catch (err){
            throw err;
        }
    }
}
