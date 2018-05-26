import * as dns from 'dns';
import { IPAddressHelper } from '.';

export class HostScannner {

    constructor(
        protected concurrentScans: number,
        protected onHostScannerResult: (result: { hostname: string, ipAddress: string }) => void,
        protected onProgress: (rate: number, remaining: number, value: number) => void,
        protected timeout: number,
    ) {

    }

    public async scanRange(from: string, to: string): Promise<Array<{ hostname: string, ipAddress: string }>> {
        const startTimestamp: Date = new Date();

        const defaultStepSize: number = this.concurrentScans;

        const results: Array<{ hostname: string, ipAddress: string }> = [];

        const start: number = IPAddressHelper.toNumber(from);
        const end: number = IPAddressHelper.toNumber(to);

        for (let ipAddressNumber = start; ipAddressNumber < end; ipAddressNumber += defaultStepSize) {
            const stepSize: number = end - ipAddressNumber >= defaultStepSize ? defaultStepSize : end - ipAddressNumber;
            const tasks: Array<Promise<{ hostname: string, ipAddress: string }>> = [];

            for (let j = 0; j < (end - ipAddressNumber >= stepSize ? stepSize : end - ipAddressNumber); j++) {
                const ipAddress: string = IPAddressHelper.fromNumber(ipAddressNumber + j);
                tasks.push(this.scan(ipAddress));
            }

            const hostScannerResults: Array<{ hostname: string, ipAddress: string }> = await Promise.all(tasks);

            for (const hostScannerResult of hostScannerResults) {
                results.push(hostScannerResult);
            }

            const numberOfRemainingIPAddresses: number = end - (ipAddressNumber + stepSize);

            const numberOfScannedIPAddresses: number = (ipAddressNumber + stepSize) - start;

            const averageNumberOfIPAddressesPerSecond: number = numberOfScannedIPAddresses / ((new Date().getTime() - startTimestamp.getTime()) / 1000);

            if (this.onProgress) {
                this.onProgress(averageNumberOfIPAddressesPerSecond, numberOfRemainingIPAddresses, (numberOfScannedIPAddresses) / (end - start) * 100);
            }
        }

        return results;
    }

    public scan(ipAddress: string): Promise<{ hostname: string, ipAddress: string }> {
        return new Promise((resolve: (result: { hostname: string, ipAddress: string }) => void, reject: (error: Error) => void) => {
            let resolved: boolean = false;

            dns.reverse(ipAddress, (error: Error, hostnames: string[]) => {
                clearInterval(timer);

                if (resolved) {
                    return;
                }

                if (error) {
                    resolve({
                        hostname: null,
                        ipAddress,
                    });
                    return;
                }

                if (hostnames.length === 0) {
                    resolve({
                        hostname: null,
                        ipAddress,
                    });
                    return;
                }

                resolve({
                    hostname: hostnames[0],
                    ipAddress,
                });
            });

            const timer: NodeJS.Timer = setTimeout(() => {
                resolved = true;

                resolve({
                    hostname: null,
                    ipAddress,
                });
            }, this.timeout);
        });
    }

}
