import { Types } from  'mongoose'
import * as crypto from "crypto";

export const createRandomObjectId = () => {
    return new Types.ObjectId(crypto.randomBytes(12));
}