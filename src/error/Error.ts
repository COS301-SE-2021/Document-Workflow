export class AuthenticationError extends Error{
    constructor(msg?: string) {
        if(msg) super(msg)
        else super();
    }
}

export class AuthorizationError extends Error{
    constructor(msg?: string) {
        if(msg) super(msg)
        else super();
    }
}

export class CloudError extends Error{
    constructor(msg?: string) {
        if(msg) super(msg)
        else super();
    }
}

export class RequestError extends Error{
    constructor(msg?: string) {
        if(msg) super(msg)
        else super();
    }
}

export class ServerError extends Error{
    constructor(msg?: string) {
        if(msg) super(msg)
        else super();
    }
}