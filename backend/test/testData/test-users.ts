import { IUser } from "../../src/user/IUser";
import UserService from "../../src/user/UserService";

export const createTestUser = async (user, userService): Promise<IUser> => {
    const res: IUser = await userService.registerUser({
        body: {
            name: user.name,
            surname: user.surname,
            initials: user.initials,
            email: user.email,
            password: user.password,
            confirmPassword: user.password
        },
        files: { signature: user.signature }
    });
    if(res){
        return res;
    }
    return null;
}

export const deleteTestUser = async (user: IUser, userService: UserService): Promise<IUser> => {
    const res: IUser = await userService.deleteUser(
        user._id,
        {
            email: user.email,
            _id: user._id
        }
    );
    if(res){
        return res;
    }
    return null;
}

export const verifyTestUser = async (user: IUser, userService): Promise<IUser> => {
    const res = await userService.verifyUser({
        query: {
            email: user.email,
            verificationCode: user.validateCode
        }
    });
    if(res){
        return res;
    }
    return null;
}

export const loginTestUser = async (user, userService): Promise<string> => {
    const token: string = await userService.loginUser(
        user.email,
        user.password
    );
    if(token){
        return token;
    }
    return null;
}

export const testUsers = {
    user1: {
        name: "Theodore",
        surname: "Testerson",
        initials: "TT",
        email: "theotest@email.com",
        password: "paSsW*or^d123",
        signature: {
            data: "textrepresentingabufferofthesignature"
        },
        authToken: ""
    },
    user2: {
        name: "James",
        surname: "McAvoy",
        initials: "JM",
        email: "jamesmcavoy@email.com",
        password: "paSsW*or^d12354",
        signature: {
            data: "textrepresentingabufferofthesignatureAnotherone"
        },
        authToken: ""
    },
    user3: {
        name: "Jomes",
        surname: "MTuvoy",
        initials: "JM",
        email: "jamevoy@email.com",
        password: "paSsW*or^d12354",
        signature: {
            data: "textrepresentingabufferofthesignatureAnotherone"
        },
        authToken: ""
    },
    user4: {
        name: "Kat",
        surname: "Stevens",
        initials: "KS",
        email: "katthekat@email.com",
        password: "paSsW*or^d1254",
        signature: {
            data: "textrepresentingabufferofthesignatureAnotherone"
        },
        authToken: ""
    }
}