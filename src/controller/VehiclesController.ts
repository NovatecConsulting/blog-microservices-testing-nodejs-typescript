import { Request, Response } from 'express';
import { NOT_FOUND, OK } from 'http-status-codes';
import { HttpError } from '../errors/HttpError';
import { ControllerResponse, IControllerResponse } from '../middlewares/AsyncControllerHandler';
import { VehicleDto } from '../models/VehicleDto';
import { VehicleService } from '../services/VehicleService';

/**
 * Serves an vehicle response.
 */
export class VehiclesController {

    /**
     * Serves the one vehicle on GET requests.
     * @param req The request.
     * @param res The response.
     */
    public static async get(req: Request, res: Response): Promise<IControllerResponse> {
        let id: string;
        if (req.params.id && req.params.id !== '') {
            id = req.params.id;
        } else {
            throw new HttpError(NOT_FOUND);
        }
        const vehicle: VehicleDto = await VehicleService.getDetailedVehicle(id);
        return new ControllerResponse(OK, vehicle);
    }

    /**
     * Serves all vehicles on GET requests.
     * @param req The request.
     * @param res The response.
     */
    public static async list(req: Request, res: Response): Promise<IControllerResponse> {
        const vehicles: VehicleDto[] = await VehicleService.listAllVehicles();
        return new ControllerResponse(OK, vehicles);
    }

    /**
     * Creates a vehicle on POST requests and serves it as response.
     * @param req The request.
     * @param res The response.
     */
    public static async post(req: Request, res: Response): Promise<IControllerResponse> {
        const vehicle: VehicleDto = await VehicleService.create(req.body);
        return new ControllerResponse(OK, vehicle);
    }
}
