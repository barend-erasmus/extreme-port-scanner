import * as fs from 'fs';
import { PortCheckerBuilder } from './builders/port-checker';
import { CheckPortResult } from './check-port-result';
import { CommonPorts } from './common-ports';
import { IPortChecker } from './interfaces/port-checker';
import { PortScanner } from './port-scanner';

(async () => {
    const portScanner: PortScanner = new PortScanner(1000);

    const checkPortResults: CheckPortResult[] = await portScanner.checkIPAddressRange('167.99.1.1', [
        CommonPorts.MONGODB,
    ], '167.99.255.255');

    const portCheckerBuilder: PortCheckerBuilder = new PortCheckerBuilder();

    for (const checkPortResult of checkPortResults) {
        if (!checkPortResult.isOpen) {
            continue;
        }

        const portChecker: IPortChecker = portCheckerBuilder.build(checkPortResult.port);

        if (!portChecker) {
            continue;
        }

        const passed: boolean = await portChecker.check(checkPortResult.ipAddress);

        if (!passed) {
            continue;
        }

        fs.appendFileSync('log.file', `${checkPortResult.ipAddress};${checkPortResult.isOpen};${checkPortResult.port};${checkPortResult.timestamp.getTime()}\r\n`);
    }
})();
