import { injectable } from 'inversify';

@injectable()
export class FooService {
    
    private people = [
        'Foo Bar',
        'Bar Baz'
    ];
    
    public getPerson(id: number) {
        return this.people[id];
    }
    
}