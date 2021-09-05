import sanitize  from "mongo-sanitize";

/**
 * @description This method sanitizes the input from the request object
 * to mitigate SQL injection attacks
 * @param req The request object
 * @param res The response object
 * @param next The next method
 */
export default async function sanitizeRequest(req, res, next): Promise<void>{
    if(req.body) sanitize(req.body);
    if(req.token) sanitize(req.token);
    if(req.params) sanitize(req.params);
    if(req.user) sanitize(req.user);
    if(req.token) sanitize(req.token);
    next();
}

//TODO: test this properly
const sanitize = async (input: String) => {
    input.replace("\'", "");
    input.replace('\"', "");
    input.replace("\\", "");
    input.replace("\/", "");
    input.replace("$", "\$");
    input.replace("[", "\[");
    input.replace("]", "\]");
    input.replace(".", "\.");
    input.replace(">", "\>");
}