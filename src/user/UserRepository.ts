import User, { UserI } from "./User";

export default class UserRepository {

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
            throw "Could not register user";
        }
    }

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
                    signature: Usr.signature
                });

         } catch(err){
             throw err;
         }
    }

    async getUsers(filter): Promise<UserI[]> {
        try {
            return await User.find(filter);
        } catch (err) {
          throw err;
        }
    }

    async getUser(id: string) : Promise<UserI> {
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
