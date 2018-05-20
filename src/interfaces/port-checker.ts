export interface IPortChecker {

    check(ipAddress: string): Promise<boolean>;

}
