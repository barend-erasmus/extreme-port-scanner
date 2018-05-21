import { PortCheckerResult } from '../models/port-checker-result';

export interface IPortChecker {

    check(ipAddress: string): Promise<PortCheckerResult>;

}
