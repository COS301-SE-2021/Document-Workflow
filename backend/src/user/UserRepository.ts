import { User } from "./User";
import { Types } from "mongoose";
import { IUser } from "./IUser";
import { Repository } from "../super/Repository";
import { DatabaseError } from "../error/Error";
type ObjectId = Types.ObjectId;

export default class UserRepository extends Repository<IUser>{

    /**
     * @returns Promise<User> The newly created user.
     * @throws Error
     * @param Usr: An object containing all the information to create a new user.
     */
    async saveUser(Usr: IUser): Promise<IUser> {
        try{
            const user = new User(Usr);
            return await user.save();
        } catch (err) {
            throw new DatabaseError("Could not save user");
        }
    }

    /**
     * @returns Promise<User[]> A list of the found users.
     * @throws Error If something goes horribly wrong.
     * @param filter An object containing the search criteria.
     */
    async findUsers(filter): Promise<IUser[]> {
        try {
            return await User.find(filter).lean();
        } catch (err) {
            throw new DatabaseError("Could not find Users " + err.message);
        }
    }

    /**
     * @returns Promise<User> The user object after it has been changed.
     * @throws Error when the user object is not found.
     * @param user
     */
    async updateUser(user: IUser): Promise<boolean>{
        try{
            const res = await User.updateOne({email: user.email}, user).lean();
            return !!res;
        }
        catch(err){
            throw new DatabaseError("Could not update User " + err.message);
        }
    }

    /**
     * @returns Promise<User> The user object if it was found
     * @throws Error if findOne breaks somehow
     * @param filter An object containing the search criteria
     */
    async findUser(filter): Promise<IUser> {
        try {
            return await User.findOne(filter).lean();
        } catch(err) {
            throw new DatabaseError("Could not find User " + err.message);
        }
    }

    /*async findUserWithContacts(filter): Promise<any> {
        try{
            return await User.findOne(filter).populate("contacts").lean();
        } catch(err) {
            throw new DatabaseError("Could not find User " + err.getMessage());
        }
    }*/

    /**
     * @returns Promise<User> The deleted user
     * @throws Error If the user could not be deleted
     * @param id The id of the user that is to be deleted
     */
    async deleteUser(id: ObjectId): Promise<IUser> {
        try{
            return await User.findOneAndDelete({_id: id}).lean();
        } catch (err){
            throw new DatabaseError("Could not delete User " + err.message);
        }
    }
}
