


/**
 * Strategy Design Pattern.
 */
export class DecisionTree{
    
    strategy: Strategy;
    documentType: string;

    constructor(strategy, type){
        this.strategy = strategy;
        this.documentType = type;
    }

    predict(text){
        return this.strategy.predict(text);
    }
}

export class Strategy{
    public predict?(text) : boolean;
}

export class ConsultantStrategy extends Strategy{
    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword', 'ContractNoKeyword','ProjectNoKeyword',
                'DateKeyword','NameKeyword', 'WitnessKeyword', 'ByKeyword']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
            return true;
        }

        if(features["ContractNoKeyword"] || features["ProjectNoKeyword"]){
            return true;
        }

        if(features["SignatureKeyword"] || features["SignKeyword"]){
            if(features["NumberSemicolons"] > 0){
                return true;
            }

            if(features["Length"] <= 5){
                return true;
            }
        }

        if(features["NameKeyword"] ){
            if(features["Length"] <= 5){
                return true;
            }
        }

        if(features["NameKeyword"] ){
            if(features["Length"] <= 5){
                return true;
            }

            if(features["NumberSemicolons"] >0){
                return true;
            }
        }

        if(features["WitnessKeyword"] && features["Length"] <= 5){
            return true;
        }

        if(features["DateKeyword"]){
            if(features["Length"] <= 5){
                return true;
            }

            if(features["NumberSemicolons"] >0 && features["Length"] <=8){
                return true;
            }
        }

        if(features["ByKeyword"]){
            if(features["NumberSemicolons"] > 0 && features["Length"] <=5){
                return true;
            }
        }

        return false
    }

    extractFeatures(content){
        const length = content.split(' ').length;
        content = content.toLowerCase().replace(":", " : "); //required otherwise semicolons aren't correctly picked up
        let features = {
            "Length": length,
            "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
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

    hasConsecutiveUnderscores(content){
        const onlyUnderscores = content.replace(/[^_/./…]/gi, ' ');
        const consecutives = onlyUnderscores.match(/([_/./…])\1*/g);
        
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
}