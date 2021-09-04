import sanitize  from "mongo-sanitize";

export default async function sanitizeRequest(req, res, next): Promise<void>{
    if(req.body) sanitize(req.body);
    if(req.token) sanitize(req.token);
    if(req.params) sanitize(req.params);
    if(req.user) sanitize(req.user);
    if(req.token) sanitize(req.token);
    next();
}