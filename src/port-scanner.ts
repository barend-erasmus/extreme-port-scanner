import * as net from 'net';
import { IPAddressHelper, PortScannerResult } from '.';

export class PortScanner {

    constructor(
        protected concurrentScans: number,
        protected onPortScannerResult: (portScannerResult: PortScannerResult) => void,
        protected onProgress: (rate: number, remaining: number, value: number) => void,
        protected timeout: number,
    ) {

    }

    public async scanIPAddressRange(from: string, ports: number[], to: string): Promise<PortScannerResult[]> {
        const startTimestamp: Date = new Date();

        const defaultStepSize: number = this.concurrentScans;

        const results: PortScannerResult[] = [];

        const start: number = IPAddressHelper.toNumber(from);
        const end: number = IPAddressHelper.toNumber(to);

        for (let ipAddressNumber = start; ipAddressNumber < end; ipAddressNumber += defaultStepSize) {
            const stepSize: number = end - ipAddressNumber >= defaultStepSize ? defaultStepSize : end - ipAddressNumber;
            const tasks: Array<Promise<PortScannerResult[]>> = [];

            for (let j = 0; j < (end - ipAddressNumber >= stepSize ? stepSize : end - ipAddressNumber); j++) {
                const ipAddress: string = IPAddressHelper.fromNumber(ipAddressNumber + j);
                tasks.push(this.scanPorts(ipAddress, ports));
            }

            const portScannerResultsResults: PortScannerResult[][] = await Promise.all(tasks);

            for (const portScannerResults of portScannerResultsResults) {
                for (const portScannerResult of portScannerResults) {
                    results.push(portScannerResult);
                }
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

    public async scanPort(ipAddress: string, port: number): Promise<PortScannerResult> {
        return new Promise((resolve: (result: PortScannerResult) => void, reject: (error: Error) => void) => {
            const client: net.Socket = new net.Socket();
            client.connect(port, ipAddress, () => {
                client.destroy();

                clearInterval(timer);

                const portScannerResult: PortScannerResult = new PortScannerResult(ipAddress, true, port, new Date());

                if (this.onPortScannerResult) {
                    this.onPortScannerResult(portScannerResult);
                }

                resolve(portScannerResult);
            });

            client.on('error', (error: Error) => {
                client.destroy();

                clearInterval(timer);

                const portScannerResult: PortScannerResult = new PortScannerResult(ipAddress, false, port, new Date());

                if (this.onPortScannerResult) {
                    this.onPortScannerResult(portScannerResult);
                }

                resolve(portScannerResult);
            });

            const timer: NodeJS.Timer = setTimeout(() => {
                client.destroy();

                const portScannerResult: PortScannerResult = new PortScannerResult(ipAddress, false, port, new Date());

                if (this.onPortScannerResult) {
                    this.onPortScannerResult(portScannerResult);
                }

                resolve(portScannerResult);
            }, this.timeout);
        });
    }

    public async scanPorts(ipAddress: string, ports: number[]): Promise<PortScannerResult[]> {
        const results: PortScannerResult[] = await Promise.all(ports.map((port: number) => this.scanPort(ipAddress, port)));

        return results;
    }

}
