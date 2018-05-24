import chalk from 'chalk';

export class TableWriter {

    public static write(rows: string[][]): void {
        let maxLength: number = Math.max(...rows.map((columns: string[]) => Math.max(...columns.map((column: string) => column.length))));

        maxLength += 2;

        const numberOfColumns: number = rows[0].length;

        console.log(`|${TableWriter.range(numberOfColumns).map(() => TableWriter.toFixedLength('-', maxLength, '')).join('|')}|`);

        for (const row of rows) {
            console.log(`|${row.map((column: string) => TableWriter.toFixedLength(' ', maxLength, column)).join('|')}|`);
            console.log(`|${TableWriter.range(numberOfColumns).map(() => TableWriter.toFixedLength('-', maxLength, '')).join('|')}|`);
        }
    }

    protected static range(n: number): number[] {
        const result: number[] = [];

        for (let i = 0; i < n; i++) {
            result.push(i);
        }

        return result;
    }

    protected static toFixedLength(fillCharacter: string, length: number, str: string): string {
        while (str.length < length) {
            str += fillCharacter;
        }

        return str;
    }

}
