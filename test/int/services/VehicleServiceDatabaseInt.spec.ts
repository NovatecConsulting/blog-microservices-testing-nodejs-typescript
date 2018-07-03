// General imports
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { VehicleEntity, COLORS } from '../../../src/persistence/entities/VehicleEntity';
import { VehicleDto } from '../../../src/models/VehicleDto';
// Database util
import VehicleRepository from '../../../src/persistence/VehicleRepository';
// Class under test
import { VehicleService } from '../../../src/services/VehicleService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('VehicleService Database Integration tests', () => {
    describe('listing all vehicles from the repository', () => {

        const vehicleEntityOne = new VehicleEntity('1GNKVEED5CJ144006', COLORS.GREEN);
        const vehicleEntityTwo = new VehicleEntity('1FTFW1EF7BFC78504', COLORS.RED);

        it(`GIVEN two existing vehicles with ids: {${vehicleEntityOne.id}, ${vehicleEntityTwo.id}} in the database, WHEN listAllVehicles() is executed, THEN the Promise will be resolved with an array from 2 VehicleDto objects.`, async () => {
            await VehicleRepository.create(vehicleEntityOne);
            await VehicleRepository.create(vehicleEntityTwo);

            const expectedFirstVehicle = new VehicleDto(vehicleEntityOne.id, vehicleEntityOne.color);
            expectedFirstVehicle.damaged = undefined;
            const expectedSecondVehicle = new VehicleDto(vehicleEntityTwo.id, vehicleEntityTwo.color);
            expectedSecondVehicle.damaged = undefined;
            const expectedVehicles = [expectedFirstVehicle, expectedSecondVehicle];

            const result = VehicleService.listAllVehicles();

            await expect(result).to.be.eventually.an('array').that.has.deep.members(expectedVehicles);
        });

        it('GIVEN no existing vehicles in the database, WHEN listAllVehicles() is executed, THEN the Promise will be resolved with an empty array.', async () => {

            const result = VehicleService.listAllVehicles();

            await expect(result).to.be.eventually.an('array').that.is.empty;
        });
    });
});
