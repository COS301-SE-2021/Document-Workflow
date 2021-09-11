const natural = require('natural');
const fs = require('fs');
var assert = require('assert');

//------Constant Values---------------------------------

const DOCUMENT_TYPES = Object.freeze({
    EXPENSE:'Expense Report', 
    CONSULTING:'Consulting Contract',
    EMPLOYMENT:'Employment Contract',
    COVID: 'Covid Screening',
    INVOICE: 'Invoice Statement',
    LEASE: 'Lease Agreement',
    LOAN: 'Loan Agreement',
    NDA: 'Non-disclosure Agreement',
    TIMESHEET: 'Timesheet'
});

const FILE_PATHS = new Map();
FILE_PATHS.set(DOCUMENT_TYPES.EXPENSE, "ExpenseReports");
FILE_PATHS.set(DOCUMENT_TYPES.CONSULTING, "ConsultingContracts");
FILE_PATHS.set(DOCUMENT_TYPES.EMPLOYMENT, "EmploymentContracts");
FILE_PATHS.set(DOCUMENT_TYPES.COVID, "CovidScreenings");
FILE_PATHS.set(DOCUMENT_TYPES.INVOICE, "InvoiceStatements");
FILE_PATHS.set(DOCUMENT_TYPES.LEASE, "LeaseAgreements");
FILE_PATHS.set(DOCUMENT_TYPES.LOAN, "LoanAgreements");
FILE_PATHS.set(DOCUMENT_TYPES.NDA, "Non-disclosureAgreements");
FILE_PATHS.set(DOCUMENT_TYPES.TIMESHEET, "Timesheets");

const OUTPUT_FILENAME = "classifier.json";
//-------------------------------------------------------------------------

const classifier = new natural.BayesClassifier();

let it = FILE_PATHS.keys();
let key = it.next().value;
while(key){     //This loop must make use of all synchronus calls otherwise the training will take place before data is added
    const path = FILE_PATHS.get(key);
    console.log("Getting all files from folder ", './Train/' + path);
    const filenames = fs.readdirSync('./Train/' + path);
    
    for(const i in filenames){
       const text = fs.readFileSync('./Train/' + path +'/' + filenames[i]).toString();
       classifier.addDocument(text,key );
    }

    key = it.next().value;
}
console.log("Finished adding documents, training classifier now");
classifier.train();
console.log("Classifier has been trained");
console.log("Testing classifier");

let incorrect = 0;
let correct = 0;

it = FILE_PATHS.keys();
key = it.next().value;
while(key){     //This loop must make use of all synchronus calls otherwise the training will take place before data is added
    const path = FILE_PATHS.get(key);
    console.log("Getting all files from folder ",'./Test/' +path);
    const filenames = fs.readdirSync('./Test/' +path);
    let smallCorrect = 0;
    let smallIncorrect = 0;
    
    for(const i in filenames){
       const text = fs.readFileSync('./Test/' + path +'/' + filenames[i]).toString();
       const prediction = classifier.classify(text);
       console.log(prediction, " ", key);
       if(prediction == key){
           smallCorrect ++;
       }
       else{
           smallIncorrect ++;
       }
    }

    correct += smallCorrect;
    incorrect += smallIncorrect;

    key = it.next().value;
}

console.log("Correct predictions: ", correct);
console.log("Incorrect predictions: ", incorrect);

console.log("Basic tests passed, saving classifier to json file");
classifier.save(OUTPUT_FILENAME, function(err, classifier){});
