import { injectable } from "tsyringe";
import { Workflow } from "../workflow/Workflow";

const fs = require("fs");
const crypt = require("crypto");

@injectable()
export default class encryption {
  constructor() {}


  createHash(workflowId: string, userId: string, userPassword: string): any {
    console.log(Date.now());
    const hash = crypt.createHash("sha256");
    return hash.update("thisIsTest" + workflowId + userId + Date.now()+ userPassword).digest();
  }

  encyrpt(data: Buffer, workflowId: string, email: string) {
    console.log(data)
    let init = crypt.randomBytes(16);
    const privateKey = this.createHash(workflowId, email,'011102151546512654684211321');

    const cipher = crypt.createCipheriv('aes256', privateKey, init);

    const cipherFile = cipher.update(data).digest();

    return init + cipherFile;
  }
}
