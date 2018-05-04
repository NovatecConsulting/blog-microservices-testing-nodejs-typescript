/**
 * This Error indicates that a stub was called with wrong arguments.
 */
export class WrongArgumentsError extends Error {

    constructor(message = 'Stub was called with wrong arguments.') {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
    }
}
