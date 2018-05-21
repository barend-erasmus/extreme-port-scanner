// async function handlePortScannerResult(portScannerResult: PortScannerResult): Promise<void> {
//     const portCheckerBuilder: PortCheckerBuilder = new PortCheckerBuilder();

//     if (!portScannerResult.isOpen) {
//         return;
//     }

//     const portChecker: IPortChecker = portCheckerBuilder.build(portScannerResult.port);

//     if (!portChecker) {
//         return;
//     }

//     const portCheckerResult: PortCheckerResult = await portChecker.check(portScannerResult.ipAddress);

//     if (!portCheckerResult.isOpen) {
//         return;
//     }

//     if (portChecker instanceof MongoDBPortChecker) {
//         // if (portCheckerResult.meta.databases.length > 0) {
//         //     fs.appendFileSync(`./logs/${portScannerResult.ipAddress}-${portScannerResult.port}-${portScannerResult.timestamp.getTime()}`, JSON.stringify(portCheckerResult.meta, null, 4));
//         // }

//         fs.appendFileSync('log.file', `${portScannerResult.ipAddress}\r\n`);
//     }

// }