import { plainToClass } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { HttpError } from '../errors/HttpError';
import { UnexpectedServiceError } from '../errors/UnexpectedServiceError';
import { ErrorHandler } from '../middlewares/ErrorHandler';
import { VehicleDto } from '../models/VehicleDto';
import { VehicleEntity } from '../persistence/entities/VehicleEntity';
import VehicleRepository from '../persistence/VehicleRepository';
import { ValidationErrorUtil } from '../util/ValidationErrorUtil';
import { DamageService } from './backends/DamageService';

/**
 * Deals with everything regarding vehicles.
 */
export class VehicleService {

    /**
     * Find the vehicle for the id and enrich the dto by the damage information.
     * @param id The id.
     */
    public static async getDetailedVehicle(id: string): Promise<VehicleDto> {
        try {
            const vehicle = await VehicleRepository.findOne(id);
            if (vehicle === null) {
                throw new HttpError(NOT_FOUND);
            }
            const vehicleDto = plainToClass(VehicleDto, vehicle);
            vehicleDto.damaged = await DamageService.getDamageState(vehicleDto.id);
            return vehicleDto;
        } catch (e) {
            await ErrorHandler.handleServiceErrors(e);
        }
        throw new UnexpectedServiceError();
    }

    /**
     * List all vehicles.
     */
    public static async listAllVehicles(): Promise<VehicleDto[]> {
        try {
            const vehicles = await VehicleRepository.findAll();
            if (vehicles === null) {
                return [];
            } else {
                return plainToClass(VehicleDto, vehicles);
            }
        } catch (e) {
            await ErrorHandler.handleServiceErrors(e);
        }
        throw new UnexpectedServiceError();
    }

    /**
     * Creates a vehicle for the given body and returns the newly created entity.
     * @param body The request body.
     */
    public static async create(body: object): Promise<VehicleDto> {
        try {
            const vehicle = await transformAndValidate(VehicleEntity, body);
            return plainToClass(VehicleDto, await VehicleRepository.create(vehicle));
        } catch (e) {
            if (await ValidationErrorUtil.checkForValidationErrors(e)) {
                throw new HttpError(BAD_REQUEST);
            }
            await ErrorHandler.handleServiceErrors(e);
        }
        throw new UnexpectedServiceError();
    }
}
