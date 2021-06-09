
let database = {}; //will just be a list of signatures

class User{

    static next_ID = 0

    constructor(Fname, Lname, email, password, signature, phone_number) {
        this.Fname = Fname;
        this.Lname = Lname;
        this.email = email;
        this.password  = password;
        this.signature = signature;
        this.phone_number = phone_number
        this.ID = User.next_ID
        this.validated = false
        User.next_ID ++
    }

}


exports.User = User
exports.database = database
