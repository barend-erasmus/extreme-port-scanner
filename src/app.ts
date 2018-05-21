import * as commander from 'commander';
import { ScanCommandHandler } from './handlers/scan-command';

commander
    .command('scan <from> <to>')
    .option('-a --advanced', 'Advanced')
    .option('-c --concurrentScans <concurrentScans>', 'Number of Concurrent Scans')
    .option('-f --file <file>', 'Path of Output File')
    .option('--onlyShowClose', 'Only Show Close Port')
    .option('--onlyShowOpen', 'Only Show Open Port')
    .option('-p --ports <ports>', 'List of Ports')
    .option('-v --verbose', 'Verbose')
    .action(ScanCommandHandler.handle);

commander.parse(process.argv);
