// General imports
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Pact, Interaction, Matchers } from '@pact-foundation/pact';
import { AUTHORIZATION_HEADER, BASIC_AUTH } from '../../../src/common/config';
import { OK, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes';
import { resolve } from 'path';
import { HttpError } from '../../../src/errors/HttpError';
// Class under test
import { DamageService } from '../../../src/services/backends/DamageService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Contract test for DamageService: getDamageState', () => {
    const provider: Pact = new Pact({
        consumer: 'vehicle-service',
        provider: 'damage-service',
        port: 8080,
        host: 'localhost',
        dir: resolve(__dirname, '../contract/pacts'),
        log: resolve(__dirname, '../contract/logs/pact.log'),
        spec: 2,
    });
    const BASIC_AUTH_MATCHER: string = '^Basic ';

    const damagedVehicleId = '1';
    const notDamagedVehicleId = '2';
    const nonExistingDamagedVehicleId = '17';

    const validInteractionForDamagedVehicle = new Interaction()
        .given(`Valid vehicle ID = ${damagedVehicleId}`)
        .uponReceiving('a valid vehicle ID from Vehicle Service')
        .withRequest({
            method: 'GET',
            path: `/damage/vehicle/${damagedVehicleId}`,
            headers: {
                [AUTHORIZATION_HEADER]: Matchers.term({
                    generate: `Basic ${BASIC_AUTH}`,
                    matcher: BASIC_AUTH_MATCHER,
                }),
            },
        })
        .willRespondWith({
            status: OK,
            body: Matchers.somethingLike({ damaged: true }),
        });

    const validInteractionForNotDamagedVehicle = new Interaction()
        .given(`Valid vehicle ID = ${notDamagedVehicleId}`)
        .uponReceiving('a valid vehicle ID from Vehicle Service')
        .withRequest({
            method: 'GET',
            path: `/damage/vehicle/${notDamagedVehicleId}`,
            headers: {
                [AUTHORIZATION_HEADER]: Matchers.term({
                    generate: `Basic ${BASIC_AUTH}`,
                    matcher: BASIC_AUTH_MATCHER,
                }),
            },
        })
        .willRespondWith({
            status: OK,
            body: Matchers.somethingLike({ damaged: false }),
        });

    const validInteractionForNonExisitingVehicle = new Interaction()
        .given(`Valid vehicle ID = ${nonExistingDamagedVehicleId}`)
        .uponReceiving('a valid non existing vehicle ID from Vehicle Service')
        .withRequest({
            method: 'GET',
            path: `/damage/vehicle/${nonExistingDamagedVehicleId}`,
            headers: {
                [AUTHORIZATION_HEADER]: Matchers.term({
                    generate: `Basic ${BASIC_AUTH}`,
                    matcher: BASIC_AUTH_MATCHER,
                }),
            },
        })
        .willRespondWith({
            status: NOT_FOUND,
        });

    before(async () => {
        await provider.setup();
    });

    after(async () => {
        await provider.finalize();
    });

    afterEach(async () => {
        await provider.removeInteractions();
    });

    it(`GIVEN vehicle id="${damagedVehicleId}", WHEN getDamageState() is executed, THEN the Promise will be resolved with true.`, async () => {
        await provider.addInteraction(validInteractionForDamagedVehicle);

        const result = DamageService.getDamageState(damagedVehicleId);

        await expect(result).to.be.eventually.true;
        await expect(provider.verify()).to.not.be.rejected;
    });

    it(`GIVEN vehicle id="${notDamagedVehicleId}", WHEN getDamageState() is executed, THEN the Promise will be resolved with false.`, async () => {
        await provider.addInteraction(validInteractionForNotDamagedVehicle);

        const result = DamageService.getDamageState(notDamagedVehicleId);

        await expect(result).to.be.eventually.false;
        await expect(provider.verify()).to.not.be.rejected;
    });

    it(`GIVEN non existing vehicle id="${nonExistingDamagedVehicleId}", WHEN getDamageState() is executed AND DamageService responds with NOT_FOUND, THEN the Promise will be rejected with HttpError(SERVICE_UNAVAILABLE).`, async () => {
        await provider.addInteraction(validInteractionForNonExisitingVehicle);

        const result = DamageService.getDamageState(nonExistingDamagedVehicleId);

        await expect(result).to.be.rejectedWith(HttpError).and.eventually.has.property('statusCode', SERVICE_UNAVAILABLE);
        await expect(provider.verify()).to.not.be.rejected;
    });
});
