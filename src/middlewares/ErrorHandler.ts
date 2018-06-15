import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes';
import { DbQueryError } from '../errors/DbQueryError';
import { HttpError } from '../errors/HttpError';
import { RepositoryError } from '../errors/RepositoryError';
import { UnexpectedServiceError } from '../errors/UnexpectedServiceError';
import { ValidationErrorUtil } from '../util/ValidationErrorUtil';

/**
 * Handles any kind of error for all endpoints and provides handler functions for different kind of services (backend, internal, etc.).
 */
export class ErrorHandler {

    /**
     * Handles different kind of errors thrown by services or controllers and send respective response.
     */
    public static handleErrors: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send();
        } else {
            res.status(INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
     * Handles all not mappable requests with a specific NOT_FOUND error.
     */
    public static handleNotFound: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        next(new HttpError(NOT_FOUND));
    }

    /**
     * Handles any kind of service errors and maps them on the respective HttpError.
     * Can also be used for handling Errors in Controllers, if Service layer isn't necessary.
     * Example: A request to a backend results in a RequestError, caused by a Timeout: HttpError(503)
     * @param e Any kind of Error.
     * @param logMeta The log meta data.
     */
    public static async handleServiceErrors(e: any): Promise<void> {
        if (e.constructor === HttpError) {
            throw e;
        }
        throw new HttpError(SERVICE_UNAVAILABLE);
    }

    /**
     * Handles any kind of repository errors and maps them on the respective RepositoryError.
     * @param e Any kind of Error.
     * @param logMeta The log meta data.
     */
    public static async handleRepositoryErrors(e: any): Promise<void> {
        if (e instanceof RepositoryError) {
            throw e;
        } else if (e instanceof TypeError) {
            throw new RepositoryError(e.message);
        } else if (e instanceof DbQueryError) {
            throw e.code !== 'ECONNRESET' ? e.code === CONFLICT ? new HttpError(CONFLICT) : new RepositoryError(e.message) : new RepositoryError(e.message, true);
        } else if (await ValidationErrorUtil.checkForValidationErrors(e)) {
            throw new RepositoryError('Validation error(s) occured during transformation from database document into entity.');
        } else {
            throw new UnexpectedServiceError();
        }
    }
}
