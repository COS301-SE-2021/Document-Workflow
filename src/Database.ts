import mongoose from "mongoose";
import { singleton } from "tsyringe";
import dotenv from "dotenv";
dotenv.config();
import { createBlackList } from "jwt-blacklist";
import { Jwt } from "jsonwebtoken";


@singleton()
export default class Database{
    private static db = null;
    private static blacklist = null;

    private static async connect(): Promise<void> {
        try{
            await mongoose.connect(process.env.MONGO_PROD_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
            Database.db = mongoose.connection;
            Database.db.on('error', console.error.bind(console, 'connection error:'));
            Database.db.once('open', () => {
                 console.log("Connection opened");
             });
            this.blacklist = await createBlackList({
                daySize: 10000 | parseInt(process.env.DAY_SIZE),
                errorRate: 0.001 | parseFloat(process.env.ERROR_RATE)
            })
        } catch (err) {
            console.error(err);
        }
    }

    static async addToBlacklist(token: Jwt): Promise<Boolean> {
        await this.get();
        if(!await this.blacklist.has(token)){
            return await this.blacklist.add(token);
        }
    }

    static async checkBlacklist(token: Jwt): Promise<Boolean>{
        await this.get();
        return await this.blacklist.has(token);
    }

    static async get(): Promise<void> {
        try{
            if(Database.db === null){
                await this.connect();
            } else {
                if(process.env.TEST_MODE)
                    console.log("Connection already exists");
            }
        } catch (err) {
            return err;
        }
    }

    static async disconnect() {
        await mongoose.disconnect();
    }
}






