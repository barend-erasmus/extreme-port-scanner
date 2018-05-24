import * as commander from 'commander';
import { ScanCommandHandler } from './handlers/scan-command';

commander
    .command('scan <from> <to>')
    .option('-a --advanced', 'Connects to port using relevant protocol. (FTP, HTTP, MongoDB, etc)')
    .option('-c --concurrentScans <concurrentScans>', 'Number of concurrent IP addresses.')
    .option('-f --file <file>', 'CSV output file path.')
    .option('--onlyShowClose', 'Only log close ports.')
    .option('--onlyShowOpen', 'Only log open ports.')
    .option('-p --ports <ports>', 'Comma-separated list of ports. Defaults to 9042,53,21,80,8080,8888,443,389,11211,27017,1433,3306,5432,5672,3389,6379,25,22,3690,23.')
    .option('-v --verbose', 'Log to console.')
    .action(ScanCommandHandler.handle);

commander.parse(process.argv);
