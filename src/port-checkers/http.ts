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
    // System Dashboard - JIRA
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

    protected static getHeader(name: string, response: any): string {
        if (response.headers[name]) {
            return response.headers[name];
        }

        return null;
    }

    protected static getPortCheckerResult(ipAddress: string, port: number, response: any): PortCheckerResult {
        const cheerioInstance: any = cheerio.load(response.data);

        return new PortCheckerResult(ipAddress, true, {
            apache: HTTPPortChecker.isApache(response),
            expressJS: HTTPPortChecker.isExpressJS(response),
            iis: HTTPPortChecker.isIIS(response),
            jenkins: HTTPPortChecker.isJenkins(response),
            nginx: HTTPPortChecker.isNginx(response),
            // title: HTTPPortChecker.title(cheerioInstance),
        }, port, new Date());
    }

    protected static isApache(response: any): boolean {
        return HTTPPortChecker.getHeader('Server', response) ? (HTTPPortChecker.getHeader('Server', response).toLowerCase().indexOf('apache') > -1) : false;
    }

    protected static isExpressJS(response: any): boolean {

        return HTTPPortChecker.getHeader('x-powered-by', response) ? (HTTPPortChecker.getHeader('x-powered-by', response).toLowerCase() === 'express') : false;
    }

    public static isIIS(response: any): boolean {
        return HTTPPortChecker.getHeader('Server', response) ? (HTTPPortChecker.getHeader('Server', response).toLowerCase().indexOf('microsoft-iis') > -1) : false;
    }

    public static isJenkins(response: any): boolean {
        return HTTPPortChecker.getHeader('X-Jenkins', response) ? true : false;
    }

    public static isNginx(response: any): boolean {
        return HTTPPortChecker.getHeader('Server', response) ? (HTTPPortChecker.getHeader('Server', response).toLowerCase().indexOf('nginx') > -1) : false;
    }

    protected static title(cheerioInstance: any): string {
        const title: string = cheerioInstance('title').text();

        return title;
    }

}
