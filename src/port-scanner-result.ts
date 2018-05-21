import * as moment from 'moment';

export class PortScannerResult {

    constructor(
        public ipAddress: string,
        public isOpen: boolean,
        public port: number,
        public timestamp: Date,
    ) {

    }

    public toCSV(): string {
        return `${this.ipAddress};${this.isOpen};${this.port};${moment(this.timestamp).format('YYYY-MM-DD HH:mm:ss')}`;
    }

}
