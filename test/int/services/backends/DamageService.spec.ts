// General imports
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HttpError } from '../../../../src/errors/HttpError';
import { VehicleEntity, COLORS } from '../../../../src/persistence/entities/VehicleEntity';
import { SERVICE_UNAVAILABLE } from 'http-status-codes';
// Class under test
import { DamageService } from '../../../../src/services/backends/DamageService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Integration test for DamageService', () => {
    describe('get damage state with DamageService interaction', () => {
        const healthyVehicle = new VehicleEntity('1', COLORS.RED);
        const damagedVehicle = new VehicleEntity('2', COLORS.BLUE);
        const notFoundVehicle = new VehicleEntity('3', COLORS.YELLOW);
        const invalidResponseVehicle = new VehicleEntity('4', COLORS.GREEN);

        it(`GIVEN vehicle id="${healthyVehicle.id}", WHEN getDamageState() is executed THEN the Promise will be resolved with false.`, async () => {

            const result = DamageService.getDamageState(healthyVehicle.id);

            await expect(result).to.be.eventually.false;
        });

        it(`GIVEN vehicle id="${damagedVehicle.id}", WHEN getDamageState() is executed THEN the Promise will be resolved with true.`, async () => {

            const result = DamageService.getDamageState(damagedVehicle.id);

            await expect(result).to.be.eventually.true;
        });

        it(`GIVEN vehicle id="${notFoundVehicle.id}", WHEN getDamageState() is executed AND DamageService responds with NOT_FOUND THEN the Promise will be rejected with HttpError(SERVICE_UNAVAILABLE).`, async () => {

            const result = DamageService.getDamageState(notFoundVehicle.id);

            await expect(result).to.be.rejectedWith(HttpError).and.eventually.has.property('statusCode', SERVICE_UNAVAILABLE);
        });

        it(`GIVEN vehicle id="${invalidResponseVehicle.id}", WHEN getDamageState() is executed AND DamageService responds with invalid body THEN the Promise will be rejected with HttpError(SERVICE_UNAVAILABLE).`, async () => {

            const result = DamageService.getDamageState(invalidResponseVehicle.id);

            await expect(result).to.be.rejectedWith(HttpError).and.eventually.has.property('statusCode', SERVICE_UNAVAILABLE);
        });
    });
});
