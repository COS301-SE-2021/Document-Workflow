import { ObjectId, Types } from "mongoose";
import {CloudError, ServerError} from "../error/Error";
import {AI, AIProps} from "./AI";
import {Phase, PhaseProps} from "../phase/Phase";

export default class AIRepository {

    async saveAI(ai: AIProps): Promise<ObjectId> {
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