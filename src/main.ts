/// <reference path="../node_modules/inversify/type_definitions/inversify/inversify.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

// import Reflect polyfill in application root
import "reflect-metadata";

import { getKernel } from './kernel';
import { getContainer } from './decorators/route-container';
import { Server } from './server';

import { FooController } from './controllers/foo-controller';
import { FooService } from './services/foo-service';

// set up kernel
getKernel().bind<FooService>('FooService').to(FooService);
getKernel().bind<FooController>('FooController').to(FooController);

// create server
var server = new Server(getContainer());

// start server
server.app.listen(3000, 'localhost', callback);

function callback() {
    console.log('listening on http://localhost:3000');
}