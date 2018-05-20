import { IPortChecker } from '../interfaces/port-checker';
import { MongoDBPortChecker } from '../port-checkers/mongodb';

export class PortCheckerBuilder {

    public build(port: number): IPortChecker {
        switch (port) {
            case 27017:
                return new MongoDBPortChecker();
            default:
                return null;
        }
    }

}
