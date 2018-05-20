import * as net from 'net';
import { CheckPortResult } from './check-port-result';
import { IPAddressHelper } from './ip-address-helper';

export class PortScanner {

    constructor(
        protected timeout: number,
    ) {

    }

    public async checkPort(ipAddress: string, port: number): Promise<CheckPortResult> {
        return new Promise((resolve: (result: CheckPortResult) => void, reject: (error: Error) => void) => {
            const client: net.Socket = new net.Socket();
            client.connect(port, ipAddress, () => {
                client.destroy();

                clearInterval(timer);

                resolve(new CheckPortResult(ipAddress, true, port, new Date()));
            });

            client.on('error', (error: Error) => {
                client.destroy();

                clearInterval(timer);

                resolve(new CheckPortResult(ipAddress, false, port, new Date()));
            });

            const timer: NodeJS.Timer = setTimeout(() => {
                client.destroy();

                resolve(new CheckPortResult(ipAddress, false, port, new Date()));
            }, this.timeout);
        });
    }

    public async checkPorts(ipAddress: string, ports: number[]): Promise<CheckPortResult[]> {
        const results: CheckPortResult[] = await Promise.all(ports.map((port: number) => this.checkPort(ipAddress, port)));

        return results;
    }

    public async checkIPAddressRange(from: string, ports: number[], to: string): Promise<CheckPortResult[]> {
        const stepSize: number = 25;

        let results: CheckPortResult[] = [];

        const start: number = IPAddressHelper.toNumber(from);
        const end: number = IPAddressHelper.toNumber(to);

        for (let ipAddressNumber = start; ipAddressNumber < end; ipAddressNumber += stepSize) {
            const tasks: Array<Promise<CheckPortResult[]>> = [];

            for (let j = 0; j < stepSize; j++) {
                const ipAddress: string = IPAddressHelper.fromNumber(ipAddressNumber + j);
                tasks.push(this.checkPorts(ipAddress, ports));
            }

            const tasksResults: CheckPortResult[][] = await Promise.all(tasks);

            for (const tasksResult of tasksResults) {
                results = results.concat(tasksResult);
            }

            console.log(`${(ipAddressNumber + stepSize - start) / (end - start) * 100} %`);
        }

        return results;
    }

}
