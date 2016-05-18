require('source-map-support').install()
import 'reflect-metadata';
import * as sinon from 'sinon';
import * as request from 'supertest';
import * as express from 'express';
import { expect } from 'chai';
import { injectable } from 'inversify';
import { Server } from '../server';
import { getKernel, refreshKernel } from '../kernel';
import { getContainer, refreshContainer } from '../decorators/route-container';
import { Controller, Method, Get, Post, Put, Patch, Head, Delete } from '../decorators/decorators';

describe('Framework Tests:', () => {

    describe('Integration Tests:', () => {
        var server: Server;

        beforeEach((done) => {
            refreshKernel();
            refreshContainer();
            done();
        });

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

            server = new Server(getContainer());
            var agent = request(server.app);

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

            server = new Server(getContainer());
            request(server.app)
                .propfind('/')
                .expect(200, 'PROPFIND', done);
        })


        it('should call all middleware in order', (done) => {
            var result = '';
            var middleware = {
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

            @injectable()
            @Controller('/')
            class TestController {
                @Get('/', spyA, spyB, spyC) getTest(req, res) { res.send('GET') }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getContainer());
            request(server.app)
                .get('/')
                .expect(200, 'GET', function () {
                    expect(spyA.calledOnce).to.be.true;
                    expect(spyB.calledOnce).to.be.true;
                    expect(spyC.calledOnce).to.be.true;
                    expect(result).to.equal('abc');
                    done();
                })
        });


        it('should use returned values as response', (done) => {
            var result = {'hello': 'world'};
            
            @injectable()
            @Controller('/')
            class TestController {
                @Get('/') getTest(req, res) { return result }
            }
            getKernel().bind<TestController>('TestController').to(TestController);

            server = new Server(getContainer());
            request(server.app)
                .get('/')
                .expect(200, JSON.stringify(result), done);
        });
    });
});