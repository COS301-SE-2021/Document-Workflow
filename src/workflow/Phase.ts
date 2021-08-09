import { Schema, model } from "mongoose";
import {PhaseStatus} from "aws-sdk/clients/datasync";


const PhaseStatus = Object.freeze({PENDING: "pending", ACCEPTED: "accepted", REJECTED: "rejected", IN_PROGRESS: "in_progress"});

/**
 * Each phase must have:
 * 1) annotations (ie action areas). This will be in the form of a single xml string
 * 2) Signer:
 *  3) viewers:
 *  4) whether or not everyone has accepted
 *  5) a status
 */
export interface PhaseI{

    _id: string,
    annotations: string,
    signer: string,
    viewers: [string],
    userAcceptances, //this will be a map but I am not sure how to specify that type at this time
    status: PhaseStatus

}

const phaseSchema = new Schema<PhaseI>({

    annotations: {type: String, required: true},
    description: {type: String, default:""},
    signer: {type: String, required: true},
    viewers: {type: [String]},
    userAcceptances: {type: Map, of: {type: Boolean}, required: true}, //From whatI understand javascript maps always have keys of type String, thus we only specify the second type for the map
    status: {type: PhaseStatus, required: true}

});

export default model<PhaseI>('Phase', phaseSchema)