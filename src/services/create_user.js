

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


    return {status:"success","data":{}, message:"New user created"};
}

function createErrorResponse(error_message)
{
    return {status:"error",data:null,"message":error_message}
}

