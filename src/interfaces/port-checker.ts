import { PortCheckerResult } from '..';

export interface IPortChecker {

    check(ipAddress: string, port: number): Promise<PortCheckerResult>;

}
