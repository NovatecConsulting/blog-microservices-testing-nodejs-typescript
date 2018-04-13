import { createServer } from 'http';
import App from './App';
import { PORT } from './common/config';
import VehicleRepository from './persistence/VehicleRepository';

const port = PORT;

const server = createServer(App);

server.listen(port);

server.on('listening', onListening);
server.on('error', onError);

function onListening(): void {
    // tslint:disable-next-line:no-console
    console.log(`Running on port ${PORT}`);
    initializeRepositories().catch((e) => {
            throw e;
        });
}

async function initializeRepositories() {
    VehicleRepository.findOne('1');
}

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        case 'EADDRINUSE':
            process.exit(1);
            break;
        default:
            throw error;
    }
}
