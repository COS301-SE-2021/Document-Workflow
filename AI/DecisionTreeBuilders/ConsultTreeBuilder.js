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
	//console.log(tokens[0]);
	//console.log(features);
	//console.log();
	data.push(features);
}

//console.log(data);
//console.log('------------------------------')
data.sort(() => Math.random() -0.5 );
//console.log(data);
const trainData = data.slice(0, data.length * TRAIN_DATA_FRACTION);
const testData = data.slice(data.length * TRAIN_DATA_FRACTION);

const features = ['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword', 'ContractNoKeyword','ProjectNoKeyword',
	'DateKeyword','NameKeyword', 'WitnessKeyword', 'ByKeyword'];
const className = 'label';
const dt = new DecisionTree(className, features);
dt.train(trainData);
console.log(testData[0]);
evaluateAccuracy(testData, dt);
const treeJSON = JSON.stringify(dt.toJSON());
fs.writeFileSync(outputFileName,treeJSON);

//-----------This extracts features for consultant document types-----------------------

function extractFeatures(content){
	content = content.toLowerCase();
	let features = {
		"Length": content.length,
		"ConsecutiveUnderscores": hasConsecutiveUnderscores(content),
		"NumberSemicolons": content.replace(/[^:]/gi, '').length,
		"SignatureKeyword": (/signature/g.test(content)),
		"SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
		"ContractNoKeyword": (/contract no/g.test(content)) || (/contract #/g.test(content)),
		"ProjectNoKeyword": (/project no/g.test(content)) || (/project #/g.test(content)),
		"DateKeyword": (/date/g.test(content)),
		"NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
		"WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
		"ByKeyword": (/by/g.test(content))
	};

	return features;
}

function hasConsecutiveUnderscores(content){
	const onlyUnderscores = content.replace(/[^_]/gi, ' ');
	const consecutives = onlyUnderscores.match(/([_])\1*/g);

	if(consecutives === null){
		return false;
	}
	for(let i=0;  i<consecutives.length; ++i){
		if(consecutives[i].length >= 2){
			return true;
		}
	}

	return false;
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