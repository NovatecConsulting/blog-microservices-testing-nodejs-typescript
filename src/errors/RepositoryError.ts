/**
 * This Error indicates that a documentdb query error occurred.
 */
export class RepositoryError extends Error {

    constructor(message?: string, public retry?: boolean) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
    }

}
