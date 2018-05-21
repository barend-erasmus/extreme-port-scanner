import chalk from 'chalk';
import * as commander from 'commander';
import * as fs from 'fs';
import { CommonPorts } from './common-ports';
import { PortScanner } from './port-scanner';
import { PortScannerResult } from './port-scanner-result';

commander
    .command('scan <from> <to>')
    .option('-f --file <file>', 'Output File')
    .option('-p --ports <ports>', 'List of Ports')
    .action((from: string, to: string, command: any) => {
        const portScanner: PortScanner = new PortScanner((portScannerResult: PortScannerResult) => {
            if (portScannerResult.isOpen) {
                console.log(`${chalk.green('OPEN: ')} ${chalk.magenta(portScannerResult.port.toString())} on ${portScannerResult.ipAddress}`);
            } else {
                console.log(`${chalk.red('CLOSED: ')} ${chalk.magenta(portScannerResult.port.toString())} on ${portScannerResult.ipAddress}`);
            }

            if (command.file) {
                fs.appendFileSync(command.file, `${portScannerResult.toCSV()}\r\n`);
            }
        }, 1000);

        portScanner.scanIPAddressRange(from, command.ports.split(',').map((x: string) => parseInt(x, undefined)), to);
    });

commander.parse(process.argv);
