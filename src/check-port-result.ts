export class CheckPortResult {

    constructor(
        public ipAddress: string,
        public isOpen: boolean,
        public port: number,
        public timestamp: Date,
    ) {

    }

}
