import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { OK, BAD_REQUEST, CONFLICT } from 'http-status-codes';
import VehicleRepository from '../../../src/persistence/VehicleRepository';
import App from '../../../src/App';
import { VehicleEntity } from '../../../src/persistence/entities/VehicleEntity';
import { transformAndValidate } from 'class-transformer-validator';

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Endpoint test for VehicleController: POST /vehicles', () => {

    const VEHICLE_ENDPOINT = '/vehicles';

    it('GIVEN a valid vehicle, WHEN posting to vehicles endpoint, THEN a Response with HTTP STATUS OK and the created vehicle will be sent.', async () => {
        const vehicle = {
            id: '1',
            color: 1,
        };

        const result = await chai.request(App)
            .post(VEHICLE_ENDPOINT)
            .send(vehicle);

        expect(result).to.have.status(OK);
        expect(result.body).to.be.deep.equal(vehicle);
    });

    it('GIVEN an invalid vehicle with wrong color code, WHEN posting to vehicles endpoint, THEN a Response with HTTP STATUS BAD_REQUEST and no body will be sent.', async () => {
        const vehicle = {
            id: '1',
            color: 9,
        };

        const result = await chai.request(App)
            .post(VEHICLE_ENDPOINT)
            .send(vehicle);

        expect(result).to.have.status(BAD_REQUEST);
        expect(result.body).to.be.empty;
    });

    it('GIVEN a valid vehicle that already exists in the database, WHEN posting to vehicles endpoint, THEN a Response with HTTP STATUS CONFLICT and no body will be sent.', async () => {
        const vehicle = {
            id: '1',
            color: 1,
        };

        await VehicleRepository.create(await transformAndValidate(VehicleEntity, vehicle));

        const result = await chai.request(App)
            .post(VEHICLE_ENDPOINT)
            .send(vehicle);

        expect(result).to.have.status(CONFLICT);
        expect(result.body).to.be.empty;
    });
});
