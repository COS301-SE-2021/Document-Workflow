
class DocumentClassifier{

    static MIN_OCCURANCES = 10;
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
        this.deleteNonUniqueWords();
    }

    deleteScarceWords(){
        for(const category of this.categories){
            console.log(category, "-------------------------------------------------------------");
            let classifier = this.classifiers[category];
            
            console.log("Size of map before: ", classifier.size);
            
            for(let [k,v] of classifier.entries()){
                
                if(v < DocumentClassifier.MIN_OCCURANCES){
                    classifier.delete(k);
                }
            }
            console.log("Size of map after: ", classifier.size);
            classifier.delete('');
        }
    }

    /**
     * The idea behind this function is that certain words will appear across multiple different document types
     * (for example, 'employer' could occur)
     */
    deleteNonUniqueWords(){
        for(const category of this.categories){
            console.log(category, "-------------------------------------------------------------");
            let classifier = this.classifiers[category];

            for(let [k,v] of classifier.entries()){
                let maxOccurances = [category,k, v];
                for(const cat of this.categories){
                    if(cat !== category){
    
                    }
                }
                
            }
            
            console.log("Size of map before: ", classifier.size);
            
            
            
            console.log("Size of map after: ", classifier.size);
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
                    weightings.set(category, weightings.get(category) + classifier.get(token));
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
       
        console.log(weightings);
        return max[0];
    }

    tokenizeString(string){
        return string.toLowerCase().replace(/[\n\:\.,\*\(\)\/\$]/g, " " ).split(' ')
    }

    save(){
        return '{}';
    }
};

module.exports = {
    DocumentClassifier
};
