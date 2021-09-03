import fs from 'fs'
import {pki, random, util} from 'node-forge'
// eslint-disable-next-line unicorn/import-style
import type {ParsedPath} from 'path'
import path from 'path'

const EXT_CERT = '.crt'
const EXT_KEY = '.key'

function createDirectory(path: ParsedPath): void {
    if (!fs.existsSync(path.dir)) {
        fs.mkdirSync(path.dir, {recursive: true})
    }
}

type getPathOptions = {
    path: string
    ca: {filename: string}
    cert: {filename: string}
}

type Paths = Record<`${'ca'|'cert'}${'Crt'|'Key'}`, ParsedPath>
export function getPaths(pathOptions: getPathOptions): Paths {
    let {path: directory, ca, cert} = pathOptions
    if (!directory.endsWith('/')) {
        directory += '/'
    }
    const caFilename = `${directory}${ca.filename}`
    const certFilename = `${directory}${cert.filename}`
    return {
        caCrt: path.parse(`${caFilename}${EXT_CERT}`),
        caKey: path.parse(`${caFilename}${EXT_KEY}`),
        certCrt: path.parse(`${certFilename}${EXT_CERT}`),
        certKey: path.parse(`${certFilename}${EXT_KEY}`),
    }
}

export function savePrivateKey(directory: ParsedPath, privateKey: pki.PrivateKey, passphrase?: string): void {
    const pem = passphrase
        ? pki.encryptRsaPrivateKey(privateKey, passphrase)
        : pki.privateKeyToPem(privateKey)
    createDirectory(directory)
    fs.writeFileSync(path.format(directory), pem, {encoding: 'utf8'})
}
export function loadPrivateKey(directory: ParsedPath, passphrase?: string): pki.PrivateKey | undefined {
    const filePath = path.format(directory)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return passphrase
        ? pki.decryptRsaPrivateKey(pem, passphrase)
        : pki.privateKeyFromPem(pem)
}

export function saveCertificate(directory: ParsedPath, cert: pki.Certificate): void {
    const pem = pki.certificateToPem(cert)
    createDirectory(directory)
    fs.writeFileSync(path.format(directory), pem, {encoding: 'utf8'})
}
export function loadCertificate(directory: ParsedPath): pki.Certificate | undefined {
    const filePath = path.format(directory)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return pki.certificateFromPem(pem)
}

export function randomSerialNumber(): string {
    const hexString = util.bytesToHex(random.getBytesSync(16))
    let mostSignificantHexAsInt = Number.parseInt(hexString[0], 16)
    if (mostSignificantHexAsInt < 8) {
        return hexString
    }

    mostSignificantHexAsInt -= 8
    return mostSignificantHexAsInt.toString() + hexString.slice(1)
}
