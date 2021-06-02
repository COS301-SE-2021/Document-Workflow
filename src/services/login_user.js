
const http = require('http')
const url = require('url')
const MockDatabase = require('./MockDatabase')
const create_user = require('./create_user')

module.exports = {
    handle: handle_login_user
};

/**
 * Very important that we send the same response for an incorrect password and an incorrect email address
 * otherwise it could lead to a security vulnerability.
 * @param req
 * @returns {{data: null, message: string, status: string}|{data: {}, message: string, status: string}}
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

function getUserByEmail(email)
{
    for(let i=0; i<Object.getOwnPropertyNames(MockDatabase.database).length; ++i)
    {
        if(MockDatabase.database[i].email === email)
            return MockDatabase.database[i]
    }

    return null
}
