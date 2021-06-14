import User, { UserI } from "./User";

export default class UserRepository {

    async postUser(Usr: UserI): Promise<void> {
        const usr = new User({
            name: Usr.name,
            surname: Usr.surname,
            initials: Usr.initials,
            email: Usr.email,
            password: Usr.password,
            validated: Usr.validated,
            tokenDate: Usr.tokenDate
        });
        try{
            await usr.save();
        } catch (err) {
            throw err;
        }
    }

    async getUsers(filter): Promise<UserI[]> {
        try {
            return await User.find(filter);
        } catch(err) {
            throw err;
        }
    }

    async getUser(id: string) {
        try {
            return await User.findById(id);
        } catch(err) {
            throw err;
        }
    }

    async deleteUser(id: string) {
        try {
            const usr: UserI = await this.getUser(id);
            return await User.deleteOne(usr);
        } catch(err) {
            throw err;
        }
    }
}
