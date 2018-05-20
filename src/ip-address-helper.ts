export class IPAddressHelper {

    public static fromNumber(ipAddress: number) {
        // tslint:disable-next-line:no-bitwise
        return ((ipAddress >>> 24) + '.' + (ipAddress >> 16 & 255) + '.' + (ipAddress >> 8 & 255) + '.' + (ipAddress & 255));
    }

    public static toNumber(ipAddress: string) {
        // tslint:disable-next-line:no-bitwise
        return ipAddress.split('.').reduce((ipInt: number, octet: string) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0;
    }

}
