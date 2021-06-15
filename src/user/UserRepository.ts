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
            tokenDate: Usr.tokenDate
        });
        try{
            return await usr.save();
        } catch (err) {
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

    // async putUser(Usr: UserI): Promise<UserI> {
    //     try {
    //         const usr = await User.findById();
    //         if(usr){
    //             const _usr = new User({
    //                 _id: Usr._id,
    //                 name: Usr.name,
    //                 surname: Usr.surname,
    //                 initials: Usr.initials,
    //                 email: Usr.email,
    //                 password: Usr.password,
    //                 validated: Usr.validated,
    //                 tokenDate: Usr.tokenDate
    //             });
    //             await _usr.save();
    //             return _usr;
    //         } else {
    //             return null;
    //         }
    //     } catch(err){
    //         throw err;
    //     }
    // }

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
