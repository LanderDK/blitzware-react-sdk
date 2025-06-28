export class BlitzWareAuthError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "BlitzWareAuthError";
    }
}
