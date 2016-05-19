import * as express from 'express';
import { Controller, Get } from '../framework/decorators';
import { FooService } from '../services/foo-service';
import { injectable, inject } from 'inversify';

@Controller('/foo')
@injectable()
export class FooController {
    
    constructor( @inject('FooService') private fooService: FooService ) {}
    
    @Get('/')
    private index(req: express.Request): string {
        return this.fooService.get(req.query.id);
    }
}