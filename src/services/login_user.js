
const http = require('http')
const url = require('url')
const MockDatabase = require('./MockDatabase')
const create_user = require('./create_user')

module.exports = {
    handle: handle_login_user
};

/**
 * This function handles a request to login a user. On failure, a generic error message is sent to avoid
 * creating any security vulnerabilities.
 * @param req: the incoming request object
 * @returns {{data: null, message: string, status: string}|{data: {}, message: string, status: string}}
 * TODO: Add a check for whether or not a user is verified.
 */
function handle_login_user(req)
{
    const queryObject = url.parse(req.url, true).query
    let email = queryObject["email"]
    let password = queryObject["password"]

    if(email === undefined)
        return {"status":"error","data":null,"message":"Field 'email' not set"}
    if(password === undefined)
        return {"status":"error","data":null,"message":"Field 'password' not set"}

    let user = getUserByEmail(email)

    if(user === null)
        return {"status":"error","data":null,"message":"Email address or password incorrect"}

    let hashed_password = create_user.hashAndSaltPassword(password)

    if(hashed_password !== user.password)
        return {"status":"error","data":null,"message":"Email address or password incorrect"}

    return {status:"success","data":{"ID": user.ID}, message:"Successful Login"} //TODO: should we return the User's ID? probably not
}

/**
 * A function that searches for a user by an email address. Returns null if no user with the specified email address
 * exists.
 * @param email: the email address to search for
 * @returns {null|*}
 * TODO: change this to work with the actual database as opposed to the Mock Database.
 */
function getUserByEmail(email)
{
    for(let i=0; i<Object.getOwnPropertyNames(MockDatabase.database).length; ++i)
    {
        if(MockDatabase.database[i].email === email)
            return MockDatabase.database[i]
    }

    return null
}
