import chalk from 'chalk';

export class SingleLineWriter {

    protected static CLEAR_LINE: string = new Buffer('1b5b304b', 'hex').toString();

    public static write(str: string): void {
        process.stdout.write(SingleLineWriter.CLEAR_LINE);
        process.stdout.write(`${str}\r`);
    }

    public static writeProgressBar(addtional: string, percentage: number): void {
        if (percentage >= 100) {
            process.stdout.write(SingleLineWriter.CLEAR_LINE);
            return;
        }

        let str: string = '';

        for (let i = 0; i < 100; i += 2) {
            if (i <= percentage) {
                str += '=';
            } else {
                str += ' ';
            }
        }

        SingleLineWriter.write(`|${str}| ${chalk.magenta(`${Math.floor(percentage)} %`)} | ${chalk.magenta(addtional)} |`);
    }

}
