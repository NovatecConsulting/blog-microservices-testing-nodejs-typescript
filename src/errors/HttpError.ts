/**
 * This Error is for indicating which http error should be send.
 */
export class HttpError extends Error {

    public statusCode: AllowedStatus;

    constructor(statusCode: AllowedStatus, message?: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
    }

    public toString(): string {
        return `${this.name}(${this.statusCode}): ${this.message}`;
    }
}

type AllowedStatus = 200 | 400 | 401 | 404 | 409 | 500 | 503;
