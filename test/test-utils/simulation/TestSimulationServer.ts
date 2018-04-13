import { createServer, Server } from 'http';
import app from './Simulation';

/**
 * Simulation server for the tests.
 */
export class TestSimulationServer {

    private server: Server;

    constructor(port = '8080') {
        app.set('port', port);
    }

    public async create(): Promise<void> {
        this.server = createServer(app);
        await new Promise((resolve, reject) => {
            this.server.listen(app.get('port'), () => {
                resolve();
            });
        });
    }

    public async close(): Promise<void> {
        await new Promise((resolve, reject) => {
            this.server.close(resolve);
        });
    }
}
