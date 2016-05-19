import 'reflect-metadata';
require('source-map-support').install()

// test libraries
import * as sinon from 'sinon';
import * as request from 'supertest';
import * as express from 'express';
import { expect } from 'chai';

// dependencies
import { injectable, IKernel } from 'inversify';
import { Server } from '../framework/server';
import { getKernel, refreshKernel } from '../framework/kernel';
import { getContainer, refreshContainer } from '../framework/route-container';
import { Controller, Method, Get, Post, Put, Patch, Head, Delete } from '../framework/decorators';

describe('Framework Tests:', () => {
    var server: Server;

    beforeEach((done) => {
        refreshKernel();
        refreshContainer();
        done();
    });
    
    describe('Routing & Request Handling:', () => {
        
        it('should add a router to routeContainer', (done) => {
            @injectable()
            @Controller('/')
            class TestController { @Get('/') getTest(req, res) { } }
            var routes = getContainer().getRoutes();

            expect(routes.length).to.equal(1);
            expect(routes[0].router).to.not.be.undefined;
            expect(routes[0].path).to.equal('/');
            done();
        });


        it('should work for each shortcut decorator', (done) => {
            @injectable()
            @Controller('/')
            class TestController {
                @Get('/') getTest(req, res) { res.send('GET') }
                @Post('/') postTest(req, res) { res.send('POST') }
                @Put('/') putTest(req, res) { res.send('PUT') }
                @Patch('/') patchTest(req, res) { res.send('PATCH') }
                @Head('/') headTest(req, res) { res.send('HEAD') }
                @Delete('/') deleteTest(req, res) { res.send('DELETE') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            var agent = request(server.build());

            var get = () => { agent.get('/').expect(200, 'GET', post) }
            var post = () => { agent.post('/').expect(200, 'POST', put) }
            var put = () => { agent.put('/').expect(200, 'PUT', patch) }
            var patch = () => { agent.patch('/').expect(200, 'PATCH', head) }
            var head = () => { agent.head('/').expect(200, 'HEAD', deleteFn) }
            var deleteFn = () => { agent.delete('/').expect(200, 'DELETE', done) }

            get();
        });


        it('should work for more obscure HTTP methods using the Method decorator', (done) => {
            @injectable()
            @Controller('/')
            class TestController {
                @Method('propfind', '/') getTest(req, res) { res.send('PROPFIND') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            request(server.build())
                .propfind('/')
                .expect(200, 'PROPFIND', done);
        });
        
        
        it('should use returned values as response', (done) => {
            var result = {'hello': 'world'};
            
            @injectable()
            @Controller('/')
            class TestController {
                @Get('/') getTest(req, res) { return result }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            request(server.build())
                .get('/')
                .expect(200, JSON.stringify(result), done);
        });
    });
    

    describe('Middleware:', () => {
        var result: string;
        var middleware: any = {
            a: function (req, res, next) {
                result += 'a';
                next();
            },
            b: function (req, res, next) {
                result += 'b';
                next();
            },
            c: function (req, res, next) {
                result += 'c';
                next();
            }
        };
        var spyA = sinon.spy(middleware, 'a');
        var spyB = sinon.spy(middleware, 'b');
        var spyC = sinon.spy(middleware, 'c');
        
        beforeEach((done) => {
            result = '';
            spyA.reset();
            spyB.reset();
            spyC.reset();
            done(); 
        });
        
        it('should call method-level middleware correctly', (done) => {
            @injectable()
            @Controller('/')
            class TestController {
                @Get('/', spyA, spyB, spyC) getTest(req, res) { res.send('GET') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            request(server.build())
                .get('/')
                .expect(200, 'GET', function () {
                    expect(spyA.calledOnce).to.be.true;
                    expect(spyB.calledOnce).to.be.true;
                    expect(spyC.calledOnce).to.be.true;
                    expect(result).to.equal('abc');
                    done();
                })
        });
        
        
        it('should call controller-level middleware correctly', (done) => {
            @injectable()
            @Controller('/', spyA, spyB, spyC)
            class TestController {
                @Get('/') getTest(req, res) { res.send('GET') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            request(server.build())
                .get('/')
                .expect(200, 'GET', function () {
                    expect(spyA.calledOnce).to.be.true;
                    expect(spyB.calledOnce).to.be.true;
                    expect(spyC.calledOnce).to.be.true;
                    expect(result).to.equal('abc');
                    done();
                })
        });
        
        
        it('should call server-level middleware correctly', (done) => {
            @injectable()
            @Controller('/')
            class TestController {
                @Get('/') getTest(req, res) { res.send('GET') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            
            server.setConfig((app) => {
               app.use(spyA);
               app.use(spyB);
               app.use(spyC); 
            });
            
            request(server.build())
                .get('/')
                .expect(200, 'GET', function () {
                    expect(spyA.calledOnce).to.be.true;
                    expect(spyB.calledOnce).to.be.true;
                    expect(spyC.calledOnce).to.be.true;
                    expect(result).to.equal('abc');
                    done();
                })
        });
        
        
        it('should call all middleware in correct order', (done) => {
            @injectable()
            @Controller('/', spyB)
            class TestController {
                @Get('/', spyC) getTest(req, res) { res.send('GET') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getKernel());
            
            server.setConfig((app) => {
               app.use(spyA); 
            });
            
            request(server.build())
                .get('/')
                .expect(200, 'GET', function () {
                    expect(spyA.calledOnce).to.be.true;
                    expect(spyB.calledOnce).to.be.true;
                    expect(spyC.calledOnce).to.be.true;
                    expect(result).to.equal('abc');
                    done();
                })
        });
    });
});