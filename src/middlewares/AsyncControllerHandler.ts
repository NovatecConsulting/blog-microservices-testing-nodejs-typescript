import { NextFunction, Request, RequestHandler, Response } from 'express';
import { OK, SERVICE_UNAVAILABLE } from 'http-status-codes';
import { TIMEOUT } from '../common/config';
import { HttpError } from '../errors/HttpError';

/**
 * Handles each controller method in order to set the response or handle errors.
 */
export class AsyncControllerHandler {
    /**
     * Async controller handler middleware to set response or to handle an error.
     * @param requestHandlerFunction The Async request handler function.
     */
    public static control(requestHandlerFunction: IAsyncRequestHandler): IRequestHandler {
        return (req: Request, res: Response, next: NextFunction): void => {
            let to: NodeJS.Timer;
            const routePromise = requestHandlerFunction(req, res, next);
            const timeoutPromise = new Promise<void>((resolve, reject) => {
                to = setTimeout(() => {
                    reject(new HttpError(SERVICE_UNAVAILABLE));
                }, TIMEOUT);
            });
            Promise.race([routePromise, timeoutPromise])
                .then((ctlRes: IControllerResponse) => {
                    clearTimeout(to);
                    res.status(ctlRes.code).send(ctlRes.body);
                }, (err) => {
                    clearTimeout(to);
                    next(err);
                });
        };
    }
}

/**
 * An async RequestHandler.
 */
export interface IAsyncRequestHandler extends RequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<IControllerResponse>;
}

/**
 * The returned RequestHandler function.
 */
export interface IRequestHandler extends RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
}

/**
 * Defines a controller response.
 */
export interface IControllerResponse {
    code: number;
    body?: any;
}

/**
 * The controller response each controller should respond with.
 */
export class ControllerResponse implements IControllerResponse {
    constructor(public code: number = OK, public body?: any) { }
}
