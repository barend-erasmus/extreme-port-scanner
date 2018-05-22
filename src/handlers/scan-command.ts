import chalk from 'chalk';
import * as fs from 'fs';
import * as humanizeDuration from 'humanize-duration';
import * as path from 'path';
import { CommonPorts, IPortChecker, PortCheckerBuilder, PortCheckerResult, PortScanner, PortScannerResult, SingleLineWriter } from '..';

export class ScanCommandHandler {

    protected static async checkPort(portScannerResult: PortScannerResult): Promise<PortCheckerResult> {
        const portCheckerBuilder: PortCheckerBuilder = new PortCheckerBuilder();

        if (!portScannerResult.isOpen) {
            return new PortCheckerResult(portScannerResult.ipAddress, false, null, portScannerResult.port, new Date());
        }

        const portChecker: IPortChecker = portCheckerBuilder.build(portScannerResult.port);

        if (!portChecker) {
            return new PortCheckerResult(portScannerResult.ipAddress, false, null, portScannerResult.port, new Date());
        }

        const portCheckerResult: PortCheckerResult = await portChecker.check(portScannerResult.ipAddress, portScannerResult.port);

        return portCheckerResult;
    }

    public static async handle(from: string, to: string, command: any): Promise<void> {
        const parameters = ScanCommandHandler.getParameters(command);

        ScanCommandHandler.printParameters(parameters);

        const portScanner: PortScanner = new PortScanner(
            parameters.concurrentScans,
            (portScannerResult: PortScannerResult) => ScanCommandHandler.onPortScannerResult(parameters, portScannerResult),
            ScanCommandHandler.onProgress,
            1000,
        );

        const portScannerResults: PortScannerResult[] = await portScanner.scanIPAddressRange(from, parameters.ports, to);

        let closeCount: number = 0;
        let openCount: number = 0;

        for (const result of portScannerResults) {
            if (result.isOpen) {
                openCount++;
                if (!parameters.advanced && parameters.showOpen && parameters.verbose) {
                    console.log(`${chalk.green('OPEN: ')} ${chalk.magenta(result.port.toString())} on ${result.ipAddress}`);
                }
            } else {
                closeCount++;
                if (!parameters.advanced && parameters.showClose && parameters.verbose) {
                    console.log(`${chalk.red('CLOSED: ')} ${chalk.magenta(result.port.toString())} on ${result.ipAddress}`);
                }
            }
        }

        console.log(`Found ${chalk.green(openCount.toString())} open ports and ${chalk.red(closeCount.toString())} closed ports`);
    }

    protected static getParameters(command: any): { advanced: boolean, concurrentScans: number, file: string, onlyShowClose: boolean, onlyShowOpen: boolean, showClose: boolean, showOpen: boolean, ports: number[], verbose: boolean } {
        const advanced: boolean = command.advanced ? true : false;

        const concurrentScans: number = command.concurrentScans ? parseInt(command.concurrentScans, undefined) : 25;

        const file: string = command.file;

        const onlyShowClose: boolean = command.onlyShowClose ? true : false;

        const onlyShowOpen: boolean = command.onlyShowOpen ? true : false;

        let ports: number[] = [
            CommonPorts.CASSANDRA,
            CommonPorts.DNS,
            CommonPorts.FTP,
            CommonPorts.HTTP_A,
            CommonPorts.HTTP_B,
            CommonPorts.HTTP_C,
            CommonPorts.HTTPS,
            CommonPorts.LDAP,
            CommonPorts.MEMCACHED,
            CommonPorts.MONGODB,
            CommonPorts.MSSQL,
            CommonPorts.MYSQL,
            CommonPorts.POSTGRESQL,
            CommonPorts.RABBITMQ,
            CommonPorts.RDP,
        ];

        if (command.ports) {
            ports = command.ports.split(',').map((x: string) => parseInt(x, undefined));
        }

        const showClose: boolean = (!onlyShowClose && !onlyShowOpen) ? true : (!onlyShowClose && onlyShowOpen) ? false : (onlyShowClose && !onlyShowOpen) ? true : true;

        const showOpen: boolean = (!onlyShowClose && !onlyShowOpen) ? true : (!onlyShowClose && onlyShowOpen) ? true : (onlyShowClose && !onlyShowOpen) ? false : true;

        const verbose: boolean = command.verbose ? true : false;

        return {
            advanced,
            concurrentScans,
            file,
            onlyShowClose,
            onlyShowOpen,
            ports,
            showClose,
            showOpen,
            verbose,
        };
    }

    protected static async onPortScannerResult(parameters: { advanced: boolean, concurrentScans: number, file: string, onlyShowClose: boolean, onlyShowOpen: boolean, showClose: boolean, showOpen: boolean, ports: number[], verbose: boolean }, portScannerResult: PortScannerResult): Promise<void> {
        if (parameters.file) {
            if (parameters.advanced) {
                const portCheckerResult: PortCheckerResult = await ScanCommandHandler.checkPort(portScannerResult);

                if ((portCheckerResult.isOpen && parameters.showOpen) || (!portCheckerResult.isOpen && parameters.showClose)) {
                    fs.appendFileSync(path.resolve(parameters.file), `${portCheckerResult.toCSV()}\r\n`);
                }
            } else {
                if ((portScannerResult.isOpen && parameters.showOpen) || (!portScannerResult.isOpen && parameters.showClose)) {
                    fs.appendFileSync(path.resolve(parameters.file), `${portScannerResult.toCSV()}\r\n`);
                }
            }
        }
    }

    protected static onProgress(rate: number, remaining: number, value: number): void {
        const secondsRemaining: number = remaining / rate;

        const humanizeDurationResult: string = humanizeDuration(secondsRemaining * 1000, { round: true });

        SingleLineWriter.writeProgressBar(`${Math.floor(rate)} per second | ${humanizeDurationResult} remaining`, value);
    }

    protected static printParameters(parameters: { advanced: boolean, concurrentScans: number, file: string, onlyShowClose: boolean, onlyShowOpen: boolean, showClose: boolean, showOpen: boolean, ports: number[], verbose: boolean }): void {
        console.log(`${chalk.green('Extreme Port Scanner:')} `);
        console.log(`    Concurrent Scans: ${chalk.magenta(parameters.concurrentScans.toString())}`);
        console.log(`    File: ${chalk.magenta(parameters.file ? path.resolve(parameters.file) : 'NONE')}`);
        console.log(`    Ports: ${chalk.magenta(parameters.ports.join(','))}`);
        console.log(`    Verbose: ${chalk.magenta(parameters.verbose ? 'TRUE' : 'FALSE')}`);
    }

}
