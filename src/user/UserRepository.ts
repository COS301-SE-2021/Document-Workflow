import { User, UserDoc, UserProps } from "./User";
import { Types } from "mongoose";

export default class UserRepository {

    /**
     * @returns Promise<User> The newly created user.
     * @throws Error
     * @param Usr: An object containing all the information to create a new user.
     */
    async postUser(Usr: UserProps): Promise<UserProps> {
        try{
            const user = new User(Usr);
            return await user.save();
        } catch (err) {
            throw {status: "failed", data: {}, message:"User email already exists"};
        }
    }

    /**
     * @returns Promise<User[]> A list of the found users.
     * @throws Error If something goes horribly wrong
     * @param filter An object containing the search criteria
     */
    async getUsers(filter): Promise<UserProps[]> {
        try {
            return await User.find(filter);
        } catch (err) {
          throw new Error(err);
        }
    }

    /**
     * @returns Promise<User> The user object after it has been changed
     * @throws Error when the user object is not found
     * @param Usr The user object to be modified
     */
    async putUser(Usr: UserDoc): Promise<UserProps>{
        try{
            return await Usr.save();
        }
        catch(err){
            console.error(err);
            throw new Error(err);
        }
    }

    async addToken(Usr: UserProps){
        try{
            return await User.updateOne({_id: Usr._id}, {tokens: Usr.tokens as any})
        }
        catch(err){
            throw new Error(err);
        }
    }

    /*async putSignature(user: UserProps): Promise<UserProps>{
        const usr: UserDoc = await User.findOne({id: user._id});
        if(usr){
            try{
                usr.signature = user.signature;
                return await usr.save();
            }
            catch(err){
                throw new Error(err);
            }
        }else{
            throw new Error("Could not find User");
        }
    }

    async addToken(user: UserProps): Promise<UserProps>{
        const usr: UserDoc = await User.findOne({id: user._id});
        if(usr){
            try{
                usr.signature = user.signature;
                return await usr.save();
            }
            catch(err){
                throw new Error(err);
            }
        }else{
            throw new Error("Could not find User");
        }
    }*/

    /**
     * @returns Promise<User> The user object if it was found
     * @throws Error if findOne breaks somehow
     * @param filter An object containing the search criteria
     */
    async getUser(filter): Promise<UserDoc> {
        try {
            return await User.findOne(filter);
        } catch(err) {
            throw new Error(err);
        }
    }

    /**
     * @returns Promise<User> The deleted user
     * @throws Error If the user could not be deleted
     * @param id The id of the user that is to be deleted
     */
    async deleteUser(id: Types._ObjectId): Promise<UserProps> {
        try{
            return await User.findOneAndDelete({_id: id});
        } catch (err){
            throw new Error(err);
        }
    }
}
