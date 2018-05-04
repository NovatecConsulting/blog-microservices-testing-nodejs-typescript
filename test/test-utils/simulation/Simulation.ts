import { json, urlencoded } from 'body-parser';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { DynamicSimulationDataInterpreter } from './DynamicSimulationDataInterpreter';
import { TestDynamicInterpreterInteraction } from '../../data/rest/simulation/TestDynamicInterpreterInteraction';
import { DamageInteractions } from '../../data/rest/simulation/DamageInteractions';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.use(urlencoded({ extended: true }));
app.use(json());

/**
 * Test Route
 */
const testRouter = (req: Request, res: Response) => {
    DynamicSimulationDataInterpreter.interpret(TestDynamicInterpreterInteraction, req, res);
};

/**
 * Damage Routes
 */
const damageRouter = (req: Request, res: Response) => {
    DynamicSimulationDataInterpreter.interpret(DamageInteractions, req, res);
};

/**
 * ROUTES registration
 */
app.post('/test/:userid/:anyOtherParam', testRouter);
app.get('/damage/vehicle/:id', damageRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // tslint:disable-next-line:no-console
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).send();
});

export default app;
