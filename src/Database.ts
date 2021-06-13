import mongoose from "mongoose";
import { singleton } from "tsyringe";

@singleton()
export default class Database{
    private static db = null;

    static async connect(): Promise<void> {
        try{
            await mongoose.connect(process.env.MONGO_PROD_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                bufferCommands: false
            });
            Database.db = mongoose.connection;
            Database.db.on('error', console.error.bind(console, 'connection error:'));
            Database.db.once('open', () => {
                 console.log("Connection opened");
             });
        } catch (err) {
            console.error(err);
        }
    }

    static async get(): Promise<void> {
        try{
            if(Database.db === null){
                await this.connect();
            } else {
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






