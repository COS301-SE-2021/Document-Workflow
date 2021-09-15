


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

}

export class CovidStrategy extends Strategy{

    static features = Object.freeze(['Length','ConsecutiveUnderscores','NumberSemicolons','SignKeyword','SignatureKeyword','DateKeyword','NameKeyword',"Temperature", "Symptoms", 'YesOrNo', 'IsQuestion']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
            return true;
        }

        if(features["Symptoms"]){
            return true;
        }

        if(features["SignKeyword"] ||features["SignatureKeyword"] || features["NameKeyword"] || features["DateKeyword"]){
            if(features["Length"] <= 5){
                return true;
            }

            if(features["NumberSemicolons"] > 0){
                return true;
            }
        }

        if(features["YesOrNo"]){
            if(features["IsQuestion"]){
                return true;
            }
        }

        if(features["Temperature"] && features["Length"] <= 5){
            return true;
        }


        return false;
    }

    extractFeatures(content){
        const length = content.split(' ').length;
        content = content.toLowerCase().replace(":", " : "); //required otherwise semicolons aren't correctly picked up
        let features = {
            "Length": length,
            'ConsecutiveUnderscores': this.hasConsecutiveUnderscores(content),
            'NumberSemicolons': content.replace(/[^:]/gi, '').length,
            "SignatureKeyword": (/signature/g.test(content)),
            "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
            "DateKeyword": (/date/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
            "Temperature": (/temperature/g.test(content)),
            "Symptoms": this.containsSymptomsKeywords(content),
            'YesOrNo': (/no/g.test(content)) || (/yes/g.test(content)),
            'IsQuestion': (/\?/g.test(content))  
        };

        return features;
    }


    containsSymptomsKeywords(content){
        const bool = ( (/temperature/g.test(content)) || (/congestion/g.test(content)) || (/nausea/g.test(content)) 
                    || (/headache/g.test(content)) || (/aches/g.test(content)) || (/cough/g.test(content)) ||(/fever/g.test(content))
                    || (/fatigue/g.test(content)) || (/breathing/g.test(content)) );
        return bool;
    }
}


export class EmploymentStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword', "Employee", "Employer",
    'DateKeyword','NameKeyword', 'WitnessKeyword', 'ByKeyword', 'Address']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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

        if(features["Employee"] || features["Employeer"]){
            if(features["Length"] <= 5){
                return true;
            }
        }

        if(features["Address"]){
            if(features["NumberSemicolons"] > 0){
                return true;
            }
            if(features["Length"] <= 5){
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
            "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
            "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
            "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
            "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
            "ByKeyword": (/by/g.test(content)),
            "Employee": (/employee/g.test(content)),
            "Employeer": (/employer/g.test(content)),
            "Address": (/address/g.test(content))
        };

        return features;
    }


}

export class ExpenseStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword',
    'DateKeyword','NameKeyword', "ByKeyword" ]);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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

            if(features["NumberSemicolons"] >0){
                return true;
            }
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

        if(features["Total"] || features["Amount"]){
            return true;
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
            "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
            "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
            "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
            "Amount": (/amount/g.test(content)),
            "Total": (/total/g.test(content)) || (/totals/g.test(content)),
            "ByKeyword": (/by/g.test(content))
        };

        return features;
    }

}

export class InvoiceStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword',
    'DateKeyword','NameKeyword', 'Description']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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

            if(features["NumberSemicolons"] >0){
                return true;
            }
        }


        if(features["DateKeyword"]){
            if(features["Length"] <= 5){
                return true;
            }

            if(features["NumberSemicolons"] >0 && features["Length"] <=8){
                return true;
            }
        }

        if(features["ByKeyword"] || features["Description"]){
            if(features["NumberSemicolons"] > 0 && features["Length"] <=5){
                return true;
            }
        }

        if(features["Total"] || features["Amount"]){
            return true;
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
            "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
            "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
            "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
            "Amount": (/amount/g.test(content)),
            "Total": (/total/g.test(content)) || (/totals/g.test(content)) || (/subtotal/g.test(content)),
            "Description": (/description/g.test(content))
        };

        return features;
    }

}

export class LeaseStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword', 'ContractNoKeyword','ProjectNoKeyword',
                'DateKeyword','NameKeyword', 'WitnessKeyword', 'ByKeyword']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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

        if(features["ByKeyword"] || features["Landlord"] || features["Tenant"]){
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
            "Landlord": (/landlord/g.test(content)) || (/lessor/g.test(content)),
            "Tenant": (/tenant/g.test(content)) || (/lessee/g.test(content)),
            "DateKeyword": (/date/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
            "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
            "ByKeyword": (/by/g.test(content)),
            'AddressKeyword': (/address/g.test(content))
        };

        return features;
    }
}

export class LoanStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword', 'Borrower','Amount',
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

        if(features["NameKeyword"] || features["AddressKeyword"] ||features["Borrower"] || features["Amount"]){
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
            "Borrower": (/borrower/g.test(content)),
            "Amount": (/amount/g.test(content)),
            "DateKeyword": (/date/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
            "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
            "ByKeyword": (/by/g.test(content)),
            'AddressKeyword': (/address/g.test(content))
        };

        return features;
    }

}

export class NDAStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword',
            'DateKeyword','NameKeyword', 'WitnessKeyword', 'ByKeyword']);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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
            "DateKeyword": (/date/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
            "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
            "ByKeyword": (/by/g.test(content)),
            };

        return features;
    }
}

export class TimesheetStrategy extends Strategy{

    static features = Object.freeze(['Length', 'ConsecutiveUnderscores', 'NumberSemicolons', 'SignKeyword','SignatureKeyword',
        'DateKeyword','NameKeyword', "Hours", "Total" ]);
    
    predict(text){

        let features = this.extractFeatures(text);

        if(features["ConsecutiveUnderscores"]){
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

            if(features["NumberSemicolons"] >0){
                return true;
            }
        }

        if((features["Hours"] || features["Total"]) && features["Length"] <= 5){
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
            "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
            "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
            "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
            "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
            "Hours": (/hours/g.test(content)),
            "Total": (/total/g.test(content)) || (/totals/g.test(content))
        };

        return features;
    }

}