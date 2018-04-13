import { json, urlencoded } from 'body-parser';
import { Application } from 'express';
// tslint:disable-next-line:no-duplicate-imports
import * as express from 'express';
import 'reflect-metadata'; // needed for class-transformer
import { PORT } from './common/config';
import { VehiclesController } from './controller/VehiclesController';
import { AsyncControllerHandler } from './middlewares/AsyncControllerHandler';
import { ErrorHandler } from './middlewares/ErrorHandler';

/**
 * Configures and utilizes the express application.
 */
class App {

    public express: Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.final();
    }

    private final(): void {
        this.express.use(ErrorHandler.handleNotFound);
        this.express.use(ErrorHandler.handleErrors);
        this.express.set('port', PORT);
    }

    private middleware(): void {
        this.express.use(urlencoded({ extended: false }));
        this.express.use(json());
    }

    private routes(): void {
        this.express.get('/vehicles', AsyncControllerHandler.control(VehiclesController.list));
        this.express.get('/vehicles/:id', AsyncControllerHandler.control(VehiclesController.get));
        this.express.post('/vehicles', AsyncControllerHandler.control(VehiclesController.post));
    }
}

export default new App().express;
