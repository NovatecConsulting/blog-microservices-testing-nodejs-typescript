import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { deepStrictEqual } from 'assert';

/**
 * Matches the request part of an interaction and responds with the corresponding response
 * when given an interactions class and request and response from express.
 */
export class DynamicSimulationDataInterpreter {

    public static interpret(clazz: new () => any, req: Request, res: Response): void {
        const rightInteraction = (Object.values(clazz) as IInteraction[]).find(
            (interaction) => DynamicSimulationDataInterpreter.testRequest(interaction.request, req),
        );
        if (rightInteraction !== undefined) {
            DynamicSimulationDataInterpreter.createAndSendResponse(rightInteraction.response, res);
        } else {
            res.status(INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
     * Compares the actual request with the given expected interaction request.
     * @param interactionRequest The interaction request part.
     * @param req The actual request.
     */
    private static testRequest(interactionRequest: IRequest, req: Request): boolean {
        if (interactionRequest.params !== undefined && !Object.entries(interactionRequest.params).every((reqPV) => reqPV[1] instanceof RegExp ? (req.params[reqPV[0]] as string).match(reqPV[1]) !== null : req.params[reqPV[0]] === reqPV[1])) {
            return false;
        }
        if (interactionRequest.queryParams !== undefined && !Object.entries(interactionRequest.queryParams).every((reqQpV) => reqQpV[1] instanceof RegExp ? (req.query[reqQpV[0]] as string).match(reqQpV[1]) !== null : req.query[reqQpV[0]] === reqQpV[1])) {
            return false;
        }
        if (interactionRequest.headers !== undefined && !Object.entries(interactionRequest.headers).every((reqH) => reqH[1] instanceof RegExp ? (req.get(reqH[0]) as string).match(reqH[1]) !== null : req.get(reqH[0]) === reqH[1])) {
            return false;
        }
        if (interactionRequest.body !== undefined) {
            try {
                deepStrictEqual(req.body, interactionRequest.body);
            } catch (e) {
                return false;
            }
        }
        return true;
    }

    /**
     * Sets / prepares the necessary parts of the response and sends it.
     * @param interactionResponse The interaction response part.
     * @param res The express response.
     */
    private static createAndSendResponse(interactionResponse: IResponse, res: Response): void {
        if (interactionResponse.headers !== undefined) {
            Object.entries(interactionResponse.headers).forEach((entry) => res.setHeader(entry[0], entry[1]));
        }
        interactionResponse.body === undefined ? res.status(interactionResponse.status).send() :
            interactionResponse.body === 'INVALID' ? res.status(interactionResponse.status).type('json').send('INVALID') : res.status(interactionResponse.status).json(interactionResponse.body);
    }
}

/**
 * An interaction for one endpoint for the simulation.
 */
export interface IInteraction {
    request: IRequest;
    response: IResponse;
}

/**
 * The request matching parameters for an interaction.
 */
interface IRequest {
    headers?: IRequestHeaders;
    body?: object | any[] | RegExp; // object or the regex that should match here
    params?: IRequestParams;
    queryParams?: IRequestQueryParams;
}

/**
 * Header fields for an interaction request or the regex that should match here.
 */
interface IRequestHeaders {
    [propName: string]: string | RegExp;
}

/**
 * Parameters for the endpoint interaction or the regex that should match here.
 */
interface IRequestParams {
    [propName: string]: string | RegExp;
}

/**
 * Query parameters for the endpoint interaction or the regex that should match here.
 */
interface IRequestQueryParams {
    [propName: string]: string | RegExp;
}

/**
 * The response for a specific interaction.
 */
interface IResponse {
    headers?: IHeaders;
    status: number;
    body?: object | any[] | 'INVALID';
}

/**
 * Header fields for an interaction response.
 */
interface IHeaders {
    [propName: string]: string;
}
