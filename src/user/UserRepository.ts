import User, { UserI } from "./User";

export default class UserRepository {

    /**
     * @returns Promise<any> The newly created user.
     * @throws Error
     * @param Usr: An object containing all the information to create a new user.
     */
    async postUser(Usr: UserI): Promise<any> {
        const usr = new User({
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
    async getUsers(filter): Promise<any[]> {
        try {
            return await User.find(filter);
        } catch (err) {
          throw new Error(err);
        }
    }

    /**
     * @returns Promise<any> The user object after it has been changed
     * @throws Error when the user object is not found
     * @param Usr The user object to be modified
     */
    async putUser(Usr: UserI): Promise<any> {
            const usr = await User.findOne({email: Usr.email});
            if(usr){
                usr.name = Usr.name;
                usr.surname = Usr.surname;
                usr.initials = Usr.initials;
                usr.email = Usr.email;
                usr.password = Usr.password;
                usr.validated = Usr.validated;
                return await usr.save();
            } else {
                throw new Error("Could not update user");
            }
    }

    /**
     * @returns Promise<any> The user object if it was found
     * @throws Error if findOne breaks somehow
     * @param filter An object containing the search criteria
     */
    async getUser(filter): Promise<any> {
        try {
            return await User.findOne(filter);
        } catch(err) {
            throw err;
        }
    }

    /**
     * @returns Promise<any> The deleted user
     * @throws Error If the user could not be deleted
     * @param id The id of the user that is to be deleted
     */
    async deleteUser(id: string): Promise<any> {
        try{
            User.findByIdAndDelete(id);
        } catch (err){
            throw err;
        }
    }
}
