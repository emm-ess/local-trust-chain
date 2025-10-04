import os from 'node:os'

export function getIPs(): string[] {
    const interfaces = os.networkInterfaces()
    return Object.values(interfaces)
        .flat()
        .filter(({family}) => family === 'IPv4')
        .map(({address}) => address)
}

export function getIPsAsAltNames(): Array<{
    type: 7
    ip: string
}> {
    return getIPs().map((ip) => ({type: 7, ip}))
}
