import jwt from "jsonwebtoken";

export class Blacklist {
    private static blacklist: string[];

    private static async removeExpiredTokens(){
        //TODO: Implement with hashmap or REDIS
        this.blacklist.forEach((token: string, index, object) => {
            const decoded: any = jwt.verify(token, process.env.SECRET);
            if(Date.now() >= decoded.exp * 1000){
                object.splice(index, 1);
            }
        });
    }

    //not persisting blacklist atm
    static async createBlacklist(){
        if(Blacklist.blacklist === undefined){
            this.blacklist = [];
        }
    }

    static async addToBlacklist(token: string){
        await Blacklist.removeExpiredTokens();
        Blacklist.blacklist.push(token);
    }

    static async checkBlacklist(token: string): Promise<boolean>{
        await Blacklist.removeExpiredTokens();
        return (Blacklist.blacklist.indexOf(token) != -1);
    }
}