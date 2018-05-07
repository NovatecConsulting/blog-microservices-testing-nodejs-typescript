import { DocumentDbTestUtil } from '../test-utils/DocumentDbTestUtil';
import VehicleRepository from '../../src/persistence/VehicleRepository';
import { TestSimulationServer } from '../test-utils/simulation/TestSimulationServer';

/**
 * This is the global integration test setup.
 * Mocha provides global hooks to call before all suites (before / after) and before each test (beforeEach / afterEach).
 */

let server: TestSimulationServer;

before(async () => {
    // Init test simulation server
    server = new TestSimulationServer();
    await server.create();

    // Init Repositories and create the database by the first call to the repository
    await VehicleRepository.findOne('');
});

after(async () => {
    // Shut down test simulation server
    await server.close();

    // Delete the testing Database
    await DocumentDbTestUtil.deleteTestDatabase();
});

afterEach(async () => {
    // Clean Repositories after each test.
    await VehicleRepository.removeAll();
});
