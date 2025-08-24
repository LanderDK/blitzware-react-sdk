export class BlitzWareAuthError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "BlitzWareAuthError";
    }
}
