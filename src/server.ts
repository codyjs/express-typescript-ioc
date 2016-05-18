import * as express from 'express';
import { IServer } from './interfaces';
import { RouteContainer } from './decorators/route-container';

/**
 * Wrapper for the express server.
 * 
 */
export class Server implements IServer {
    
    public app: express.Application;
    
    constructor(private routeContainer: RouteContainer) {
        this.app = express();
        this.config();
    }
    
    private config() {
        // set up routes
        this.routeContainer.getRoutes().forEach((route) => {
            this.app.use(route.path || '*', ...(route.middleware || []), route.router);
        });
    }
}