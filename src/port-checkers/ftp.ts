import * as FTP from 'ftp';
import { IPortChecker, PortCheckerResult } from '..';

export class FTPPortChecker implements IPortChecker {

    public check(ipAddress: string, port: number): Promise<PortCheckerResult> {
        return new Promise((resolve: (result: PortCheckerResult) => void, reject: (error: Error) => void) => {
            const client: FTP = new FTP();

            client.on('error', (error: Error) => {
                client.end();

                resolve(new PortCheckerResult(ipAddress, false, null, port, new Date()));
            })
;
            client.on('ready', () => {
                client.list((error: Error, list: string) => {
                    if (error) {
                        client.end();
                        resolve(new PortCheckerResult(ipAddress, false, null, port, new Date()));
                        return;
                    }

                    client.end();

                    resolve(new PortCheckerResult(ipAddress, false, null, port, new Date()));
                });
            });

            client.connect({
                host: `${ipAddress}`,
                port,
            });
        });
    }

}
