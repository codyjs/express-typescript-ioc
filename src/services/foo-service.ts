import { injectable } from 'inversify';

@injectable()
export class FooService {
    
    private data = {
      1: 'Foo',
      2: 'Bar'  
    };
    
    public get(id: number): string {
        return this.data[id];
    }
}