import * as moment from 'moment';

export class PortCheckerResult {

    constructor(
        public ipAddress: string,
        public isOpen: boolean,
        public meta: any,
        public port: number,
        public timestamp: Date,
    ) {
    }

    public toCSV(): string {
        return `${this.ipAddress};${this.isOpen};${this.port};${moment(this.timestamp).format('YYYY-MM-DD HH:mm:ss')};${JSON.stringify(this.meta)}`;
    }

}
