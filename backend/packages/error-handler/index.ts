export class AppError extends Error {
    public readonly statusCode : number;
    public readonly isOperational : boolean;
    public readonly details? : any;

    constructor(message : string, statusCode : number, isOperational : boolean = true, details? : any){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(message : string = "Resource Not Found"){
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message : string = "Invalid Request Data", details? : any){
        super(message, 400, true, details);
    }
}



export class AuthError extends AppError {
    constructor(message : string = "Unauthorized"){
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message : string = "Forbiddened Access"){
        super(message, 403);
    }
}

export class DatabaseError extends AppError {
    constructor(message : string = "Database Error", details? : any){
        super(message, 500, true, details);
    }
}

export class RateLimitError extends AppError {
    constructor(message : string = "Too many Requests, Pleasre Try again later"){
        super(message, 429);
    }
}

