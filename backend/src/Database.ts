import mongoose from "mongoose";
import { singleton } from "tsyringe";
import dotenv from "dotenv";
import { Blacklist } from "./security/Blacklist";
dotenv.config();

@singleton()
export default class Database{
    private static db = null;

    private static async connect(): Promise<void> {
        Database.db = mongoose.connection;
        Database.db.on('error', console.error.bind(console, 'connection error:'));
        Database.db.once('open', () => {
            console.log("Connection opened to MongoDB");
        });

        try{
            await Blacklist.createBlacklist();
            await mongoose.connect(process.env.MONGO_PROD_URI);
        } catch (err) {
            console.error(err);
        }
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






