# express-ioc
Example Express 4.x project in Typescript using [Inversify](https://github.com/inversify/InversifyJS) as an IoC container.

To be used as a starting point for Typescript Express applications.

## Usage
Run `npm install && typings install` followed by `npm start` will run the application.

Run `npm test` to run mocha tests.

## Decorators

#### `@Controller(path, [middleware, ...])`

Registers the decorated class as a controller with a root path, and optionally registers any global middleware for this controller.

#### `@Method(method, path, [middleware, ...])`

Registers the decorated method as a request handler for a particular path and method, where the method is a valid method on the express.Router class.

#### `@SHORTCUT(path, [middleware, ...])`

Shortcut decorators which are simply wrappers for `@Method`. Right now these include `@Get`, `@Post`, `@Put`, `@Patch`, `@Head`, `@Delete`, and `@All`. For anything more obscure, use `@Method` (Or make a PR :smile:).

### Example

```Typescript
import * as express from 'express';
import { injectable } from 'inversify';
import { Controller, Get } from './decorators/decorators';

@injectable()
@Controller('/hello')
class HelloWorldController {
  @Get('/')
  getFoo(request: express.Request): string {
    // returned values are sent by response.send()
    return 'hello ' + (request.query.person || 'world');
  }
  
  @Get('/json')
  getFooJson(request: express.Request, response: express.Response): void {
    // you are also free to use the response object yourself (without returning)
    response.json({ 'hello': request.query.person || 'world'});
  }
}

```

## TODO
* Add IoC examples
