import { IInteraction } from '../../../test-utils/simulation/DynamicSimulationDataInterpreter';

/**
 * This is only for testing purpose of the dynamic simulation data interpreter.
 */
export class TestDynamicInterpreterInteraction {
    public static TEST_ONE: IInteraction = {
        request: {
            params: {
                userid: 'testuser',
                anyOtherParam: 'test',
            },
            queryParams: {
                queryParamOne: '34',
                anotherQuery: 'test',
            },
            headers: {
                'X-ApplicationName': 'test-app',
                'testHeader': 'test',
            },
            body: {
                test: 'test',
            },
        },
        response: {
            status: 200,
            headers: {
                'test-1': 'test',
                'test2': 'test',
            },
            body: {
                test: 'test',
                data: [ '1', 1 ],
            },
        },
    };

    public static TEST_TWO: IInteraction = {
        request: {
            params: {
                userid: 'testuser',
                anyOtherParam: 'test',
            },
            headers: {
                'X-ApplicationName': 'test-app',
                'otherHeader': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
            },
        },
        response: {
            status: 200,
        },
    };
}
