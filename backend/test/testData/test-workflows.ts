
export const testWorkflows = {
    workflow1: {
        name: "TestWorkflowName",
        description: "Test workflow description",
        document: {
            name: "Name_of_some_file.pdf",
            size: 500,
            data: Buffer.from("textrepresentingabufferofthefile")
        },
        phases:
            [{
                annotations: `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">
                    <fields /><annots><text page="0" rect="403.910,255.480,434.910,286.480" color="#FFCD45" flags="print,nozoom,norotat
                    e" name="85328653-6e78-ffb3-e3c5-65bc6d0939df" title="brenton.stroberg@yahoo.co.za" subject="Note" 
                    date="D:20210918060454+02'00'" creationdate="D:20210918060450+02'00'" icon="Comment" statemodel="Rev
                    iew"><trn-custom-data bytes="{&q
                    uot;trn-mention&quot;:&quot;{\\&quot;contents\\&quot;:\\&quot;sign\\&quot;,\\&quot;ids\\&quot;:[]}
                    &quot;}"/><contents>sign</contents></text></annots><pages><defmtx matrix="1,0,0,-1,0,595" /></pages></xfdf>`,
                description: "Description of a phase in a workflow",
                users: JSON.stringify([
                    {
                        user:"jamesmcavoy@email.com",
                        permission:"sign",
                        accepted:"false"
                    }]),
                status: ""
            }]
    }
}