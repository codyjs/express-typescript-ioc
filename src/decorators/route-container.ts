import * as express from 'express';

var controllerContainer: RouteContainer;

export function refreshContainer() {
    controllerContainer = new RouteContainer();
}

export function getContainer() {
    if (!controllerContainer) refreshContainer();
    return controllerContainer;
}

export class RouteContainer {
    private container = {};
    
    public registerHandler(httpMethod: string, path: string | RegExp, target: any, middleware: Function[], callback: Function) {
        if (!this.container[target.constructor]) {
            this.container[target.constructor] = {};
            this.container[target.constructor].router = express.Router();
        }
        
        var router: express.Router = this.container[target.constructor].router;
        
        router[httpMethod](path, ...middleware, callback);
    }
    
    public registerController(path: string | RegExp, middleware: Function[], target: any) {
        
        if (this.container[target]) {
            this.container[target].path = path;
            this.container[target].middleware = middleware;
        }
    }
    
    public getRoutes() {
        var routes = [];
        for (var i in this.container) {
            if (this.container.hasOwnProperty(i)) {
                routes.push(this.container[i]);
            }
        }
        return routes;
    }
}