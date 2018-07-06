// General imports
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HttpError } from '../../../src/errors/HttpError';
import { VehicleEntity, COLORS } from '../../../src/persistence/entities/VehicleEntity';
import { SERVICE_UNAVAILABLE, NOT_FOUND } from 'http-status-codes';
import { VehicleDto } from '../../../src/models/VehicleDto';
import VehicleRepository from '../../../src/persistence/VehicleRepository';
// Class under test
import { VehicleService } from '../../../src/services/VehicleService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Component tests for VehicleService', () => {
    describe('getting detailed vehicle via Database and DamageService interactions', () => {
        const nonExistingVehicleId = '12';
        const existingVehicleId = '2';
        const invalidResponseVehicleId = '4';

        it(`GIVEN a non existing vehicle ID = ${nonExistingVehicleId} in the database, WHEN getDetailedVehicle() is executed, THEN the Promise will be rejected with HttpError(NOT_FOUND).`, async () => {

            const result = VehicleService.getDetailedVehicle(nonExistingVehicleId);

            await expect(result).to.be.rejectedWith(HttpError).and.eventually.has.property('statusCode', NOT_FOUND);
        });

        it(`GIVEN an existing vehicle ID = ${existingVehicleId} in the database, WHEN getDetailedVehicle() is executed AND DamageService responds with true, THEN the Promise will be resolved with the correct VehicleDto.`, async () => {
            const expectedVehicleDto = new VehicleDto(existingVehicleId, COLORS.GREEN, true);
            const vehicleEntity = new VehicleEntity(existingVehicleId, COLORS.GREEN);
            await VehicleRepository.create(vehicleEntity);

            const result = VehicleService.getDetailedVehicle(existingVehicleId);

            await expect(result).to.be.eventually.deep.equal(expectedVehicleDto);
        });

        it(`GIVEN an existing vehicle ID = ${invalidResponseVehicleId} in the database, WHEN getDetailedVehicle() is executed AND DamageService responds with invalid body, THEN the Promise will be rejected with HttpError(SERVICE_UNAVAILABLE).`, async () => {
            const vehicleEntity = new VehicleEntity(invalidResponseVehicleId, COLORS.BLUE);
            await VehicleRepository.create(vehicleEntity);

            const result = VehicleService.getDetailedVehicle(invalidResponseVehicleId);

            await expect(result).to.be.rejectedWith(HttpError).and.to.have.eventually.property('statusCode', SERVICE_UNAVAILABLE);
        });

    });
});
