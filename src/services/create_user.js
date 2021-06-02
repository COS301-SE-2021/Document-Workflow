

const http = require('http')
const url = require('url')
const MockDatabase = require('./MockDatabase')
const Verifier = require("email-verifier")

module.exports = {
    handle: handle_create_user
};

/**
 * Checks for input parameters based on the following order:
 * id: search by id
 * email: search by email address
 * username: search by username
 * If none of the above are specified, then an error message will be returned
 * @param req
 *
 */
function handle_create_user(req) {

    const queryObject = url.parse(req.url, true).query

    let names = ["Fname", "Lname", "email", "password", "phone_number"]
    const data = {Fname: queryObject["Fname"], Lname:queryObject["Lname"], email:queryObject["email"],
                password:queryObject["password"], phone_number:queryObject["phone_number"]}

    for(let i=0; i<names.length;++i)  //check that all necessary fields have been set
        if(data[names[i]] === undefined)
            return createErrorResponse("Field '" + names[i] + "' not set")

    if(checkIfEmailInUse(data["email"]))
        return createErrorResponse("Email address already in use")
    if(!passwordIsValid(data["password"]))
        return createErrorResponse("Password invalid")
    if(!emailIsValid(data["email"]))
        return createErrorResponse("Email address invalid")

    data["password"] = hashAndSaltPassword(data["password"])

    let id = createUser(data)

    return {status:"success","data":{"ID":id}, message:"New user created"};
}

//TODO: add a salt to our secrets file
//TODO: implement
function hashAndSaltPassword(password)
{
    return password
}


//------------------Functions that check if unique user fields are actually unique---------------------

function checkIfEmailInUse(email)
{
    for(let i=0; i<Object.getOwnPropertyNames(MockDatabase.database).length; ++i)
    {
        if(MockDatabase.database[i].email === email)
            return true
    }
    return false
}

//---------------Functions that check if the necessary requirements for the new UserProfile are met--------------

/*
    In order for a password to be valid it must:
    1)contain 1 lowercase character
    2) contain 1 uppercase character
    3)contain 1 numeric character
    4)contain 1 special character
    5) be at least 9 characters long
 */
function passwordIsValid(password)
{
    let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    return strongRegex.test(password)
}


//Validating email addresses using regex isn't the best solution.
//TODO: chat to Quinton/Daryl about whether they would be willing to pay for an email verification service
//TODO: swap at the regex here, it isn't best practice
//(Free version only allows so many requests per month)
function emailIsValid(email)
{
    /* In order to use this code, contact Timothy to get the APIkey and password.
    let verifier = new Verifier("your_whoisapi_username", "your_whoisapi_password");
    verifier.verify("r@rdegges.com", {},(err, data) => {
        if (err) throw err;
        console.log(data);
    });
    return true
     */

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function createErrorResponse(error_message)
{
    return {status:"error",data:null,"message":error_message}
}

//---------------------------------------------------------------------------------------

function createUser(user_data)
{
    let new_user = new MockDatabase.User(user_data["Fname"], user_data["Lname"], user_data["email"],
        user_data["password"], null, user_data["phone_number"])

    MockDatabase.database[new_user.ID]  = new_user;
    return new_user.ID
}