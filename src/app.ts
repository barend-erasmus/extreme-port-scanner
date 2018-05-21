import chalk from 'chalk';
import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { CommonPorts } from './common-ports';
import { SingleLineWriter } from './console-writers/single-line';
import { PortScanner } from './port-scanner';
import { PortScannerResult } from './port-scanner-result';

commander
    .command('scan <from> <to>')
    .option('-c --concurrentScans <concurrentScans>', 'Concurrent Scans')
    .option('-f --file <file>', 'Output File')
    .option('-p --ports <ports>', 'List of Ports')
    .option('-v --verbose', 'Verbose')
    .action(handleScanCommand);

commander.parse(process.argv);

async function handleScanCommand(from: string, to: string, command: any): Promise<void> {
    const concurrentScans: number = command.concurrentScans ? parseInt(command.concurrentScans, undefined) : 25;
    const file: string = command.file;

    let ports: number[] = [
        CommonPorts.CASSANDRA,
        CommonPorts.DNS,
        CommonPorts.FTP,
        CommonPorts.HTTP,
        CommonPorts.HTTPS,
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

    const verbose: boolean = command.verbose ? true : false;

    console.log(`${chalk.green('Extreme Port Scanner:')} `);
    console.log(`    Concurrent Scans: ${chalk.magenta(concurrentScans.toString())}`);
    console.log(`    File: ${chalk.magenta(file ? path.resolve(file) : 'NONE')}`);
    console.log(`    Ports: ${chalk.magenta(ports.join(','))}`);
    console.log(`    Verbose: ${chalk.magenta(verbose ? 'TRUE' : 'FALSE')}`);

    const portScanner: PortScanner = new PortScanner(concurrentScans, (portScannerResult: PortScannerResult) => {
        if (file) {
            fs.appendFileSync(file, `${portScannerResult.toCSV()}\r\n`);
        }
    }, (rate: number, value: number) => {
        SingleLineWriter.writeProgressBar(`${Math.floor(rate)} per second`, value);
    }, 1000);

    const portScannerResults: PortScannerResult[] = await portScanner.scanIPAddressRange(from, ports, to);

    let closeCount: number = 0;
    let openCount: number = 0;

    for (const result of portScannerResults) {
        if (result.isOpen) {
            openCount++;
            if (verbose) {
                console.log(`${chalk.green('OPEN: ')} ${chalk.magenta(result.port.toString())} on ${result.ipAddress}`);
            }
        } else {
            closeCount++;
            if (verbose) {
                console.log(`${chalk.red('CLOSED: ')} ${chalk.magenta(result.port.toString())} on ${result.ipAddress}`);
            }
        }
    }

    console.log(`Found ${chalk.green(openCount.toString())} open ports and ${chalk.red(closeCount.toString())} closed ports`);
}
