export default class RequestError extends Error{
    constructor(message: string) {
        super(message);
    }
}