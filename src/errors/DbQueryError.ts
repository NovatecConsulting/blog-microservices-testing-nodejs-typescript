import { QueryError } from 'documentdb';

/**
 * This Error indicates that a documentdb query error occurred.
 */
export class DbQueryError extends Error implements QueryError {

    public code: any;
    public body: any;

    constructor(err: QueryError, message?: string) {
        super(message);
        this.code = err.code;
        this.body = err.body;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
    }
}
