const DecisionTree = require('decision-tree');
const fs = require('fs');

const lines = fs.readFileSync('./sampleLines.txt',{flag:'r'} ).toString().split(/\r\n|\r|\n/);
const labels = fs.readFileSync('./labels.txt',{flag:'r'}).toString().split(/\r\n|\r|\n/);
const TRAIN_DATA_FRACTION = 0.7;
const outputFileName = './ConsultDecisionTree.json';

let data = [];

for(let i=0;i<lines.length; ++i){
	let features = extractFeatures(lines[i]);
	features["label"] = labels[i];
	data.push(features);
}

data.sort(() => Math.random() -0.5 );
const trainData = data.slice(0, data.length * TRAIN_DATA_FRACTION);
const testData = data.slice(data.length * TRAIN_DATA_FRACTION);

const features = ['Length','SignKeyword','SignatureKeyword','DateKeyword','NameKeyword',"Temperature", "Symptoms", 'YesOrNo', 'IsQuestion'];  
const className = 'label';
const dt = new DecisionTree(className, features);
dt.train(trainData);
console.log(testData[0]);
evaluateAccuracy(testData, dt);
const treeJSON = JSON.stringify(dt.toJSON());
fs.writeFileSync(outputFileName,treeJSON);


function extractFeatures(content){
	content = content.toLowerCase();
	let features = {
		"Length": content.length,
		"SignatureKeyword": (/signature/g.test(content)),
		"SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
		"DateKeyword": (/date/g.test(content)),
		"NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
        "Temperature": (/temperature/g.test(content)),
        "Symptoms": containsSymptomsKeywords(content),
        'YesOrNo': (/no/g.test(content)) || (/yes/g.test(content)),
        'IsQuestion': (/\?/g.test(content))
	};

	return features;
}

function containsSymptomsKeywords(content){
    const bool = ( (/temperature/g.test(content)) || (/congestion/g.test(content)) || (/nausea/g.test(content)) 
                    || (/headache/g.test(content)) || (/aches/g.test(content)) || (/cough/g.test(content)) ||(/fever/g.test(content))
                    || (/fatgiue/g.test(content)) || (/breathing/g.test(content)) );
    return bool;
}


function evaluateAccuracy(testData, dt){
	let correctPredictions = 0;
	let incorrectPredictions = 0;
	for(let i=0; i<testData.length; ++i){
		const prediction = dt.predict(testData[i]);
		if(prediction == testData[i]['label']){
			correctPredictions ++;
		}
		else {
			incorrectPredictions ++;
		}
	}
	console.log("Correct Predictions: ", correctPredictions);
	console.log("IncorrectPredictions: ", incorrectPredictions);
}