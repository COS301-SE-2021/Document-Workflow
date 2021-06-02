
const http = require('http')
const url = require('url')
const MockDatabase = require('./MockDatabase')
const create_user = require('./create_user')

module.exports = {
    handle: handle_login_user
};


function handle_login_user(req)
{
    const queryObject = url.parse(req.url, true).query
    let email = queryObject["email"]
    let password = queryObject["password"]

    if(email === undefined)
        return {"status":"error","data":null,"message":"Field 'email' not set"}
    if(password === undefined)
        return {"status":"error","data":null,"message":"Field 'password' not set"}

    return {status:"success","data":{}, message:"Fields all set"}
}

function getUserByEmail(email)
{

}
