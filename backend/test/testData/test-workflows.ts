import { IWorkflow} from "../../src/workflow/IWorkflow";
import { Schema, Types } from "mongoose";
const ObjectId = Types.ObjectId;

export const testWorkflow = {
    name: "TestWorkflowName",
    description: "Test workflow description",
    ownerEmail: undefined,
    ownerId: undefined,
    phases: [{
        users: '[{"user":"contactsuser1@email.com","permission":"sign","accepted":"false"}]',
        annotations: `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">
        <fields /><annots><text page="0" rect="403.910,255.480,434.910,286.480" color="#FFCD45" flags="print,nozoom,norotat
                        e" name="85328653-6e78-ffb3-e3c5-65bc6d0939df" title="brenton.stroberg@yahoo.co.za" subject="Note" 
                        date="D:20210918060454+02'00'" creationdate="D:20210918060450+02'00'" icon="Comment" statemodel="Rev
                        iew"><trn-custom-data bytes="{&q
                        uot;trn-mention&quot;:&quot;{\\&quot;contents\\&quot;:\\&quot;sign\\&quot;,\\&quot;ids\\&quot;:[]}
                        &quot;}"/><contents>sign</contents></text></annots><pages><defmtx matrix="1,0,0,-1,0,595" /></pages></xfdf>`,
        description: 'Boopety boopety boopety beep',
        status: 'Pending',
        _id: new ObjectId("614565693878ee3a66168275")
    }]
}

export const testWorkflows = {
    workflow1: {
        name: "TestWorkflowName",
        description: "Test workflow description",
        document: {
            data: "textrepresentingabufferofthefile"
        },
        phases: JSON.stringify(
            [
                {
                    annotations: `[{"annotations":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\" ?><xfdf xmlns=\\"http://ns.adobe.com/xfdf/\\" xml:space=\\"preserve\\"><fields /><annots><text page=\\"0\\" rect=\\"653.560,195.100,684.560,226.100\\" color=\\"#FFCD45\\" flags=\\"prin
                                        t,nozoom,norotate\\" name=\\"af1773d6-8d7f-4db9-e852-417c1fc70095\\" title=\\"brenton.stroberg@yahoo.co.za\\" subject=\\"Note\\" date=\\"D:20210918053500+02'00'\\" creationdate=\\"D:20210918053455+02'00'\\" icon=\\"Comment\\" statemodel=\\"Revie
                                        w\\"><trn-custom-data bytes=\\"{&quot;trn-mention&quot;:&quot;{\\\\&quot;contents\\\\&quot;:\\\\&quot;sign here please\\\\&quot;,\\\\&quot;ids\\\\&quot;:[]}&quot;}\\"/><contents>sign here please</contents></text></annots><pages><defmtx matrix=\\"1
                                        ,0,0,-1,0,595\\" /></pages></xfdf>","description":"The first and only phase","users":[{"user":"contactsuser1@email.com","permission":"sign","accepted":"false"}]}]`,
                    description: "Description of a workflow",
                    users: [
                        {
                            user:"contactsuser1@email.com",
                            permission:"sign",
                            accepted:"false"
                        }]
                }
            ])
    }
}