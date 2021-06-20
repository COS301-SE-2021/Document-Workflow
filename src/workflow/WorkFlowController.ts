// import { Router } from "express";
// import { autoInjectable } from "tsyringe";
// import UserService from "./../user/UserService";
// import User, { UserModel } from "./../user/User";
// import workFlowService from "./WorkFlowService";
// import WorkFlow ,{ WorkFlowModel } from "./WorkFlow"
// import WorkFlowService from "./WorkFlowService";
//
// @autoInjectable()
// export default class WorkFlowController{
//     router: Router;
//
//     constructor(private workflowService: WorkFlowService) {
//         this.router = new Router();
//     }
//
//     async createWorkFlow(req) : Promise<WorkFlow> {
//         try{
//             return await this.workflowService.createWorkFlow(req);
//         } catch(err) {
//             throw err;
//         }
//     }
//
//     routes() {
//
//         this.router.post("",async (req, res) => {
//             try {
//                 res.status(200).json(await this.createWorkFlow(req));
//             } catch(err){
//                 res.status(400).json(err);
//             }
//         });
//         return this.router;
//     }
//
//
// }