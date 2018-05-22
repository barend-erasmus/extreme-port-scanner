# Extreme Port Scanner

## Installation

`npm install -g extreme-port-scanner`

## Usage

```
extreme-port-scanner scan 
    --advanced
    --concurrentScans <concurrentScans>
    --file <file>
    --onlyShowClose
    --onlyShowOpen
    --ports <ports>
    --verbose
```

## Example

`extreme-port-scanner scan --ports 22 192.168.46.1 192.168.46.10`

## Screenshot

![](https://github.com/barend-erasmus/extreme-port-scanner/raw/master/images/screenshot.png)

## Commands

### Scan

```
extreme-port-scanner scan 
    --advanced
    --concurrentScans <concurrentScans>
    --file <file>
    --onlyShowClose
    --onlyShowOpen
    --ports <ports>
    --verbose
```

### Options

*Advanced* - Connects to port using relevant protocol. (FTP, HTTP, MongoDB, etc)

*Concurrent Scans* - Number of concurrent IP addresses.

*File* - CSV output file path.

*Only Show Close* - Only log close ports.

*Only Show Open* - Only log open ports.

*Ports* - Comma-separated list of ports. Defaults to ...

*Verbose* - Log to console.
