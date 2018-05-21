import * as net from 'net';
import { IPAddressHelper } from './ip-address-helper';
import { PortScannerResult } from './port-scanner-result';

export class PortScanner {

    constructor(
        protected onPortScannerResult: (portScannerResult: PortScannerResult) => void,
        protected timeout: number,
    ) {

    }

    public async scanIPAddressRange(from: string, ports: number[], to: string): Promise<PortScannerResult[]> {
        const stepSize: number = 25;

        const results: PortScannerResult[] = [];

        const start: number = IPAddressHelper.toNumber(from);
        const end: number = IPAddressHelper.toNumber(to);

        for (let ipAddressNumber = start; ipAddressNumber < end; ipAddressNumber += stepSize) {
            const tasks: Array<Promise<PortScannerResult[]>> = [];

            for (let j = 0; j < stepSize; j++) {
                const ipAddress: string = IPAddressHelper.fromNumber(ipAddressNumber + j);
                tasks.push(this.scanPorts(ipAddress, ports));
            }

            const portScannerResultsResults: PortScannerResult[][] = await Promise.all(tasks);

            for (const portScannerResults of portScannerResultsResults) {
                for (const portScannerResult of portScannerResults) {
                    results.push(portScannerResult);
                }
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
