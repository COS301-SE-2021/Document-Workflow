import { Schema, model } from "mongoose";
import { IPhase } from "./IPhase";

export const PhaseStatus = Object.freeze({PENDING:"Pending", INPROGRESS:"InProgress", REJECTED:"Rejected", COMPLETED:"Completed", CREATE: "Create", DELETE: "Delete", EDIT:"Edit"});

export const phaseSchema = new Schema<IPhase>({
    users: { type: String, required: true },
    annotations: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, default: PhaseStatus.PENDING },
});

export const Phase = model<IPhase>('Phase', phaseSchema);