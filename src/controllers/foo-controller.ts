import * as express from 'express';
import { Controller, Get } from '../decorators/decorators';
import { FooService } from '../services/foo-service';
import { injectable, inject } from 'inversify';

@Controller('/foo')
@injectable()
export class FooController {
    
    constructor( @inject('FooService') private fooService: FooService ) {}
    
    @Get('/')
    private index(req: express.Request) {
        console.log(`getting person ${req.query.id}`);
        return this.fooService.getPerson(req.query.id);
    }
}