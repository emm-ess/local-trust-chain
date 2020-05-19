import fs from 'fs'
import {parse, format, ParsedPath} from 'path'
import {pki, util, random} from 'node-forge'

const EXT_CERT = '.crt'
const EXT_KEY = '.key'

function createDirectory(path: ParsedPath){
    if (!fs.existsSync(path.dir)) {
        fs.mkdirSync(path.dir, {recursive: true})
    }
}

type getPathOptions = {
    path: string
    ca: {filename: string}
    cert: {filename: string}
}

export function getPaths({path, ca, cert}: getPathOptions){
    if (!path.endsWith('/')) {
        path += '/'
    }
    const caFilename = `${path}${ca.filename}`
    const certFilename = `${path}${cert.filename}`
    return {
        caCrt: parse(`${caFilename}${EXT_CERT}`),
        caKey: parse(`${caFilename}${EXT_KEY}`),
        certCrt: parse(`${certFilename}${EXT_CERT}`),
        certKey: parse(`${certFilename}${EXT_KEY}`),
    }
}

export function savePrivateKey(path: ParsedPath, privateKey: pki.PrivateKey, passphrase?: string): void{
    const pem = passphrase
        ? pki.encryptRsaPrivateKey(privateKey, passphrase)
        : pki.privateKeyToPem(privateKey)
    createDirectory(path)
    fs.writeFileSync(format(path), pem, {encoding: 'utf8'})
}
export function loadPrivateKey(path: ParsedPath, passphrase?: string): pki.PrivateKey | undefined{
    const filePath = format(path)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return passphrase
        ? pki.decryptRsaPrivateKey(pem, passphrase)
        : pki.privateKeyFromPem(pem)
}

export function saveCertificate(path: ParsedPath, cert: pki.Certificate): void{
    const pem = pki.certificateToPem(cert)
    createDirectory(path)
    fs.writeFileSync(format(path), pem, {encoding: 'utf8'})
}
export function loadCertificate(path: ParsedPath): pki.Certificate | undefined{
    const filePath = format(path)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return pki.certificateFromPem(pem)
}

export function randomSerialNumber(){
    const hexString = util.bytesToHex(random.getBytesSync(16))
    let mostSiginficativeHexAsInt = parseInt(hexString[0], 16)
    if (mostSiginficativeHexAsInt < 8) {
        return hexString
    }

    mostSiginficativeHexAsInt -= 8
    return mostSiginficativeHexAsInt.toString() + hexString.substring(1)
}
