import { Types } from "mongoose";
import { CloudError, ServerError } from "../error/Error";
import { AI } from "./AI";
import { Phase } from "../phase/Phase";
import { IAI } from "./IAI";
type ObjectId = Types.ObjectId;

export default class AIRepository {

    async saveAI(ai: IAI): Promise<ObjectId> {
        try {
            const newAI = new Phase(ai);
            await newAI.save();
            return newAI._id;
        }
        catch(e){
            console.log(e);
            throw e;
        }
    }

    async getAIById(id){
        try{
            return await AI.findById(id);
        }
        catch (e){
            throw new ServerError(e);
        }
    }

}