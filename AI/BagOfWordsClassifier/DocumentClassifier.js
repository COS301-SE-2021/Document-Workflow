
class DocumentClassifier{

    static MIN_OCCURANCES = 50;
    categories;
    classifiers;

    constructor(){
        this.classifiers = {};
        this.categroies = [];
    }

    setCategories(categories){
        this.categories = categories;
        for(const category of categories){
            this.classifiers[category] = new Map();
        }
    }

    addDocument(documentText, category){
        //1) Tokenize text.
        //2) Increment dictionary count for words
        const tokens = this.tokenizeString(documentText);
        for(const token of tokens){
            if(this.classifiers[category].get(token) != undefined){
                this.classifiers[category].set(token, this.classifiers[category].get(token) + 1);
            }
            else{
                this.classifiers[category].set(String(token), 0);
            }
        }
    }

    train(){
        this.deleteScarceWords();
    }

    deleteScarceWords(){
        for(const category of this.categories){
            let classifier = this.classifiers[category];

            for(let [k,v] of classifier.entries()){

                if(v < DocumentClassifier.MIN_OCCURANCES){
                    classifier.delete(k);
                }
            }
            classifier.delete('');
        }
    }

    /**
     * The idea behind this function is that certain words will appear across multiple different document types
     * (for example, 'employer' could occur)
     */
    deleteNonUniqueWords(){
        for(const category of this.categories){

            let classifier = this.classifiers[category];

            for(let [k,v] of classifier.entries()){
                let maxOccurances = [category,k, v];
                for(const cat of this.categories){
                    if(cat !== category){
                        let otherClassifier = this.classifiers[cat];
                        if(otherClassifier.get(k) > maxOccurances[2]){
                            maxOccurances = [cat, k, otherClassifier.get(k)];
                        }
                    }
                }
                for(const cat of this.categories){
                    if(cat !== maxOccurances[0]){
                        let otherClassifier = this.classifiers[cat];
                        otherClassifier.delete(maxOccurances[1]);
                    }
                }

            }
        }
    }

    classify(documentText){
        const weightings = new Map();
        for(const category of this.categories){
            weightings.set(category, 0);
        }
        const tokens = this.tokenizeString(documentText);
        for(const token of tokens){
            for(const category of this.categories){

                let classifier = this.classifiers[category];

                if(classifier.has(token)){
                    weightings.set(category, weightings.get(category) + 1);
                }
            }
        }

        let max = [this.categories[0], -1];
        for(const category of this.categories){
            if(weightings.get(category) > max[1]){
                max[0] = category;
                max[1] = weightings.get(category);
            }
        }

        return max[0];
    }

    tokenizeString(string){
        return string.toLowerCase().replace(/[\n\:\.,\*\(\)\/\$\]\[\_\"\t]/g, " " ).split(' ')
    }

    save(){
        const saveObject = {};
        for(const category  of this.categories){
            const classifier = this.classifiers[category];
            const obj = {}
            for (let [k,v] of classifier)
                obj[k] = v;
            saveObject[category] = obj;
        }

        return JSON.stringify(saveObject);
    }

    load(jsonString){
        const object = JSON.parse(jsonString);
        const entries = Object.entries(object);
        this.categories = [];
        for(let i=0;i<entries.length; ++i){
            this.categories.push(entries[i][0]);
        }
        this.classifiers = {};
        for(const category of this.categories){
            this.classifiers[category] = new Map();
            for(let i=0;i<entries.length; ++i){

                if(entries[i][0] == category){
                    const dict = entries[i][1];
                    const dictEntries = Object.entries(dict);

                    for(let k=0; k<dictEntries.length; k++){
                        this.classifiers[category].set(dictEntries[k][0], dictEntries[k][1]);
                    }

                }
            }
        }
    }
};

module.exports = {
    DocumentClassifier
};
