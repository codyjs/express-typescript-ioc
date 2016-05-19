/// <reference path="../node_modules/inversify/type_definitions/inversify/inversify.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import "reflect-metadata";
import * as express from 'express';
import { Kernel } from 'inversify';
import { Server } from './framework/server';
import { FooController } from './controllers/foo-controller';
import { FooService } from './services/foo-service';

// set up kernel
var kernel = new Kernel();
kernel.bind<FooService>('FooService').to(FooService);
kernel.bind<FooController>('FooController').to(FooController);

// create server
var server = new Server(kernel);

server
    .build()
    .listen(3000, 'localhost', callback);

function callback() {
    console.log('listening on http://localhost:3000');
}