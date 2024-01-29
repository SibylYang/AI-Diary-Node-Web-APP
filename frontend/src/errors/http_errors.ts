class HttpError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}
/**
 * status code: 401
 */
export class UnauthorizedError extends HttpError {}
/**
 * status code: 409
 */
export class ConflictError extends HttpError {}
