import { IInteraction } from '../../../test-utils/simulation/DynamicSimulationDataInterpreter';
import { AUTHORIZATION_HEADER, BASIC_AUTH } from '../../../../src/common/config';
import { OK } from 'http-status-codes';

/**
 * Provides Damage endpoint possible interactions
 * @version v1 - https://damage.example.com
 */
export class DamageInteractions {
    public static VALID_INTERACTION_ID_1: IInteraction = {
        request: {
            params: {
                id: '1',
            },
            headers: {
                [AUTHORIZATION_HEADER]: `Basic ${BASIC_AUTH}`,
            },
        },
        response: {
            status: OK,
            body: {
                damaged: false,
            },
        },
    };

    public static VALID_INTERACTION_ID_2: IInteraction = {
        request: {
            params: {
                id: '2',
            },
            headers: {
                [AUTHORIZATION_HEADER]: `Basic ${BASIC_AUTH}`,
            },
        },
        response: {
            status: OK,
            body: {
                damaged: true,
            },
        },
    };
}
