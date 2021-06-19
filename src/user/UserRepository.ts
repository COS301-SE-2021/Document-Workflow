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
            validated: Usr.validated,
            tokenDate: Usr.tokenDate,
            validateCode: Usr.validateCode,
            signature: Usr.signature
        });
        try{
            return await usr.save();
        } catch (err) {
            throw {status: "failed", data: {}, message:"User email already exists"};
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
    async putUser(Usr: UserI): Promise<void> {
        try {
            const updated_user = await User.updateOne({email:Usr.email}, {
                name: Usr.name,
                surname: Usr.surname,
                initials: Usr.initials,
                password: Usr.password,
                validated: Usr.validated,
                validateCode: Usr.validateCode,
                tokenDate: Usr.tokenDate,
                signature: Usr.signature,
                owned_workflows: Usr.owned_workflows,
                workflows: Usr.workflows
            });

        } catch(err){
            throw err;
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
    async deleteUser(id: string) {
        try {
            const usr: UserI = await this.getUser(id);
            return await User.deleteOne(usr);
        } catch(err) {
            throw err;
        }
    }
}
