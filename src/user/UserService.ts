import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserI } from "./User";

@injectable()
export default class UserService {

    constructor(private userRepository: UserRepository) {
    }

    async getUser(request): Promise<UserI> {
        if(!request.params.id){
            throw new URIError("id is required");
        }
        try{
            const res = await this.userRepository.getUsers({_id: request.params.id});
            return res[0];
        }catch(err) {
            throw err;
        }
    }

    async getUsers(): Promise<UserI[]> {
        try{
            const users = await this.userRepository.getUsers({});
            console.log(users);
            return users;
        }catch(err){
            throw err;
        }
    }

    async postUser(request): Promise<any> {
        //Validation:
        if(request.body.length === 0 || !request.body) {
            return { message: "No User details sent" };
        } else {
            try {
                const Usr = request.body;
                const usr: UserI = {
                    name: Usr.name,
                    surname: Usr.surname,
                    initials: Usr.initials,
                    email: Usr.email,
                    password: Usr.password,
                    validated: Usr.validated,
                    tokenDate: Usr.tokenDate
                }
                return await this.userRepository.postUser(usr)
            } catch (err) {
                throw err;
            }
        }
    }

    async deleteUser(request): Promise<{}> {
        const id = request.params.id;
        if(!id){
            return { message: "No user specified" };
        }
        const usr = await this.userRepository.getUser(id);
        if(!usr){
            return { message: "User not found" };
        }
        return { user: await this.userRepository.deleteUser(id) };
    }

}

// router.get('/:id', (req,res)=>{
//     User.findById(req.params.id)
//         .then((usr)=>{
//             if(usr){
//                 res.status(200).json({
//                     message: "Success!",
//                     id: usr._id,
//                     name: usr.name,
//                     surname: usr.surname,
//                     email: usr.email
//                 });
//             } else{
//                 res.status(404).json({
//                     message: "User was not found"
//                 });
//             }
//         })
//         .catch((msg)=>{
//             console.log(msg);
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// function compare(pass,hashed){
//     bcrypt.compare(pass, hashed, (err,match) => {
//         if(err){
//             throw err;
//         } else return match;
//     });
//     return false;
// }
//
// router.post('/login/:id', (req, res) => {
//     //res.json(login_user.handle(req));
//     User.findById(req.params.id)
//         .then((usr)=>{
//             if(usr){
//                 // if(compare(req.body.password, usr.password)){
//                 if(req.body.password === usr.password){
//                     res.status(200).json({
//                         message: "Success!",
//                         token: "generated token"
//                     });
//                 } else {
//                     res.status(401).json({
//                         message: "Unauthorized"
//                     });
//                 }
//             } else{
//                 res.status(404).json({
//                     message: "User was not found"
//                 });
//             }
//         })
//         .catch((msg)=>{
//             console.log(msg);
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// /**
//  * The api entry point for registering a new user. The request requires the following body parameters be set:
//  *  name: the user's firstname
//  *  surname: the user's surname
//  *  initials the user's initials
//  *  email: the user's email address
//  *  password: the user's password
//  *
//  *  TODO: incorporate the signature to this function.
//  *  TODO: abstract the database functionality to a different file.
//  */
// router.post('', (req, res) => {
//
//     //TODO: Convert password to hash with bcryptjs
//     const user = new User({
//         name: req.body.name,
//         surname: req.body.surname,
//         initials: req.body.initials,
//         email: req.body.email,
//         password: req.body.password,
//     });
//
//     user.save()
//         .then((usr)=>{
//             res.status(200).json({
//                 message: "User added successfully",
//                 userId: usr._id
//             });
//         })
//         .catch((msg)=>{
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// module.exports = router;

