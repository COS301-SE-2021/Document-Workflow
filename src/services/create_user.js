

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


    return {status:"success","data":{}, message:"New user created"};
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


function createErrorResponse(error_message)
{
    return {status:"error",data:null,"message":error_message}
}

