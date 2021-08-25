import Phase, {PhaseI} from "./Phase";

export default class PhaseRepository{

    async createPhase(phase: PhaseI): Promise<any> {
        const newPhase = new Phase({
            annotations: phase.annotations,
            signer: phase.signer,
            viewers: phase.viewers,
            userAcceptances: phase.userAcceptances,
            status: phase.status
        });

        try {
            await newPhase.save();
        } catch (err) {
            throw err;
        }

        return newPhase._id;

    }
}