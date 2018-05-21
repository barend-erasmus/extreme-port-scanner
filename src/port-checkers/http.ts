import axios from 'axios';
import * as cheerio from 'cheerio';
import { IPortChecker, PortCheckerResult } from '..';

export class HTTPPortChecker implements IPortChecker {

    // Apache Tomcat
    // Apache Tomcat/9.0.2
    // IIS Windows Server
    // Statistics Report for HAProxy
    // Welcome to nginx!
    // Dashboard [Jenkins]
    public async check(ipAddress: string, port: number): Promise<PortCheckerResult> {
        try {
            const response: any = await axios.get(`http://${ipAddress}:${port}`);

            return HTTPPortChecker.getPortCheckerResult(ipAddress, port, response);
        } catch (error) {
            if (!error.response) {
                return new PortCheckerResult(ipAddress, false, null, port, new Date());
            }

            return HTTPPortChecker.getPortCheckerResult(ipAddress, port, error.response);
        }
    }

    protected static getPortCheckerResult(ipAddress: string, port: number, response: any): PortCheckerResult {
        const cheerioInstance: any = cheerio.load(response.data);

        return new PortCheckerResult(ipAddress, true, {
            expressJS: HTTPPortChecker.isExpressJS(response),
            phpAdmin: HTTPPortChecker.isPHPAdmin(cheerioInstance),
            title: HTTPPortChecker.title(cheerioInstance),
        }, port, new Date());
    }

    protected static isExpressJS(response: any): boolean {
        return response.headers['x-powered-by'] === 'express';
    }

    protected static isPHPAdmin(cheerioInstance: any): boolean {
        const title: string = cheerioInstance('title').text();

        if (title === 'phpMyAdmin') {
            return true;
        }

        return false;
    }

    protected static title(cheerioInstance: any): string {
        const title: string = cheerioInstance('title').text();

        return title;
    }

}
