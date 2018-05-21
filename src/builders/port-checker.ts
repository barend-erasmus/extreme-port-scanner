import { IPortChecker, MongoDBPortChecker } from '..';
import { FTPPortChecker } from '../port-checkers/ftp';
import { HTTPPortChecker } from '../port-checkers/http';

export class PortCheckerBuilder {

    public build(port: number): IPortChecker {
        switch (port) {
            case 21:
                return new FTPPortChecker();
            case 80:
                return new HTTPPortChecker();
            case 8080:
                return new HTTPPortChecker();
            case 8888:
                return new HTTPPortChecker();
            case 27017:
                return new MongoDBPortChecker();
            default:
                return null;
        }
    }

}
