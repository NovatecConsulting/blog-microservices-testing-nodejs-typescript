import { createServer } from 'http';
import app from './Simulation';

/**
 * Create HTTP server.
 */
const port = '8080';
app.set('port', port);
const server = createServer(app);
server.listen(app.get('port'), () => {
    // tslint:disable-next-line:no-console
    console.log('Simulation server listening on port ' + app.get('port'));
});
