import * as mongoose from "mongoose";

export default class Database{
    private db = null;
    async connect(){
        try{
            await mongoose.connect(process.env.MONGO_PROD_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
        } catch (err) {
            return err;
        }
    }

    async get() {
        try{
            if(this.db === null){
                this.db = await this.connect();
            } else {
                return this.db;
            }
        } catch (err) {
            return err;
        }
    }
}






