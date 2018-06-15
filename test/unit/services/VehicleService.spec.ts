// General imports
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import { SinonStub, match, createSandbox } from 'sinon';
import { WrongArgumentsError } from '../../test-utils/WrongArgumentsError';
import { VehicleEntity, COLORS } from '../../../src/persistence/entities/VehicleEntity';
import { VehicleDto } from '../../../src/models/VehicleDto';
import { HttpError } from '../../../src/errors/HttpError';
import { SERVICE_UNAVAILABLE, NOT_FOUND } from 'http-status-codes';
import { RepositoryError } from '../../../src/errors/RepositoryError';
// Stubbing
import VehicleRepository from '../../../src/persistence/VehicleRepository';
import { DamageService } from '../../../src/services/backends/DamageService';
import * as ClassTransformer from 'class-transformer';
import { ErrorHandler } from '../../../src/middlewares/ErrorHandler';
// Class under test
import { VehicleService } from '../../../src/services/VehicleService';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;
const sb = createSandbox();

describe('VehicleService', () => {
    describe('#getDetailedVehicle()', () => {
        const id = '1';
        const vehicleEntity = new VehicleEntity(id, COLORS.BLUE);
        const vehicleDto = new VehicleDto();
        vehicleDto.id = vehicleEntity.id;
        vehicleDto.color = vehicleEntity.color;
        const expectedVehicleDto = new VehicleDto();
        expectedVehicleDto.id = vehicleDto.id;
        expectedVehicleDto.color = vehicleDto.color;
        expectedVehicleDto.damaged = true;
        const httpError = new HttpError(SERVICE_UNAVAILABLE);
        const someError = new TypeError('Some TypeError.');
        const repositoryError = new RepositoryError('Some RepositoryError.');
        const notFoundError = new HttpError(NOT_FOUND);

        beforeEach(() => {
            sb.stub(VehicleRepository, 'findOne').rejects(new WrongArgumentsError());
            sb.stub(DamageService, 'getDamageState').rejects(new WrongArgumentsError());
            sb.stub(ClassTransformer, 'plainToClass').throws(new WrongArgumentsError());
            sb.stub(ErrorHandler, 'handleServiceErrors').rejects(new WrongArgumentsError());
        });

        afterEach(() => {
            sb.restore();
        });

        it(`GIVEN an id = "${id}", WHEN getDetailedVehicle() is executed, THEN the Promise will be resolved with ${expectedVehicleDto}.`, async () => {
            (VehicleRepository.findOne as SinonStub).withArgs(id).resolves(vehicleEntity);
            (ClassTransformer.plainToClass as SinonStub).withArgs(VehicleDto, vehicleEntity).returns(vehicleDto);
            (DamageService.getDamageState as SinonStub).withArgs(vehicleDto.id).resolves(true);

            const result = VehicleService.getDetailedVehicle(id);

            expect(result).to.be.eventually.deep.equal(expectedVehicleDto);
        });

        it(`GIVEN an id = "${id}" that doesn't exist, WHEN getDetailedVehicle() is executed, THEN the Promise will be rejected with HttpError(${NOT_FOUND}).`, async () => {
            (VehicleRepository.findOne as SinonStub).withArgs(id).resolves(null);
            (ErrorHandler.handleServiceErrors as SinonStub).withArgs(match.instanceOf(HttpError).and(match.hasOwn('statusCode', NOT_FOUND))).rejects(notFoundError);

            const result = VehicleService.getDetailedVehicle(id);

            expect(result).to.be.rejectedWith(notFoundError);
        });

        it(`GIVEN an id = "${id}", WHEN getDetailedVehicle() is executed AND getDamageState() rejects with ${httpError}, THEN the Promise will be rejected with ${httpError}.`, async () => {
            (VehicleRepository.findOne as SinonStub).withArgs(id).resolves(vehicleEntity);
            (ClassTransformer.plainToClass as SinonStub).withArgs(VehicleDto, vehicleEntity).returns(vehicleDto);
            (DamageService.getDamageState as SinonStub).withArgs(vehicleDto.id).rejects(httpError);
            (ErrorHandler.handleServiceErrors as SinonStub).withArgs(httpError).rejects(httpError);

            const result = VehicleService.getDetailedVehicle(id);

            expect(result).to.be.rejectedWith(httpError);
        });

        it(`GIVEN an id = "${id}", WHEN getDetailedVehicle() is executed AND plainToClass() rejects with ${someError}, THEN the Promise will be rejected with ${httpError}.`, async () => {
            (VehicleRepository.findOne as SinonStub).withArgs(id).resolves(vehicleEntity);
            (ClassTransformer.plainToClass as SinonStub).withArgs(VehicleDto, vehicleEntity).throws(someError);
            (ErrorHandler.handleServiceErrors as SinonStub).withArgs(someError).rejects(httpError);

            const result = VehicleService.getDetailedVehicle(id);

            expect(result).to.be.rejectedWith(httpError);
        });

        it(`GIVEN an id = "${id}", WHEN getDetailedVehicle() is executed AND findOne() rejects with ${repositoryError}, THEN the Promise will be rejected with ${httpError}.`, async () => {
            (VehicleRepository.findOne as SinonStub).withArgs(id).rejects(repositoryError);
            (ErrorHandler.handleServiceErrors as SinonStub).withArgs(repositoryError).rejects(httpError);

            const result = VehicleService.getDetailedVehicle(id);

            expect(result).to.be.rejectedWith(httpError);
        });
    });
});
