/**
 * This Error indicates that a unexpected error in a service occured.
 */
export class UnexpectedServiceError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
    }
}
