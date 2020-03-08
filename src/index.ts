import fs from 'fs'
import Path from 'path'
import {userInfo, homedir} from 'os'

import {pki, util, random, md} from 'node-forge'
import internalIp from 'internal-ip'



type ltcCertOptions = {
    subject: pki.CertificateField[]
    issuer: pki.CertificateField[]
    keySize: 2048 | 4096
    signingKey?: pki.PrivateKey
    validity: number
    extensions: any[]
}

type ltcOptions = {
    path: string
    ca: {
        filename: string
        keySize: ltcCertOptions['keySize']
        validity: ltcCertOptions['validity']
        saveToDisc: boolean
        passphrase?: string
    }
    cert: {
        filename: string
        keySize: ltcCertOptions['keySize']
        validity: ltcCertOptions['validity']
    }
}


const EXT_CERT = '.crt'
const EXT_KEY = '.key'

const USER_NAME = userInfo().username

const DEFAULT_OPTIONS: ltcOptions = {
    path: `${homedir()}/.local-trust-chain/`,
    ca: {
        filename: 'local-ca',
        keySize: 2048,
        validity: 720,
        saveToDisc: true,
    },
    cert: {
        filename: 'local',
        keySize: 2048,
        validity: 720,
    },
}

const ATTRS_CA = [
    {shortName: 'O', value: USER_NAME},
    {shortName: 'OU', value: USER_NAME},
    {shortName: 'CN', value: `${USER_NAME} local-ca`},
]

const ATTRS_CERT = [
    {shortName: 'O', value: `${USER_NAME} local-dev`},
    {shortName: 'OU', value: USER_NAME},
]

const EXTENSIONS_CA = [
    {
        name: 'basicConstraints',
        critical: true,
        cA: true,
        pathLenConstraint: 0,
    },
    {
        name: 'keyUsage',
        critical: true,
        cRLSign: true,
        keyCertSign: true,
    },
]

const EXTENSIONS_CERT = [
    {
        name: 'basicConstraints',
        critical: true,
        cA: false,
    },
    {
        name: 'keyUsage',
        critical: true,
        digitalSignature: true,
        keyEncipherment: true,
    },
]

function createDirectory(path: Path.ParsedPath){
    if (!fs.existsSync(path.dir)) {
        fs.mkdirSync(path.dir, {recursive: true})
    }
}

function savePrivateKey(path: Path.ParsedPath, privateKey: pki.PrivateKey, passphrase?: string): void{
    const pem = passphrase
        ? pki.encryptRsaPrivateKey(privateKey, passphrase)
        : pki.privateKeyToPem(privateKey)
    createDirectory(path)
    fs.writeFileSync(Path.format(path), pem, {encoding: 'utf8'})
}
function loadPrivateKey(path: Path.ParsedPath, passphrase?: string): pki.PrivateKey | undefined{
    const filePath = Path.format(path)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return passphrase
        ? pki.decryptRsaPrivateKey(pem, passphrase)
        : pki.privateKeyFromPem(pem)
}

function saveCertificate(path: Path.ParsedPath, cert: pki.Certificate): void{
    const pem = pki.certificateToPem(cert)
    createDirectory(path)
    fs.writeFileSync(Path.format(path), pem, {encoding: 'utf8'})
}
function loadCertificate(path: Path.ParsedPath): pki.Certificate | undefined{
    const filePath = Path.format(path)
    if (!fs.existsSync(filePath)) {
        return
    }
    const pem = fs.readFileSync(filePath, {encoding: 'utf8'})
    return pki.certificateFromPem(pem)
}

function randomSerialNumber(){
    const hexString = util.bytesToHex(random.getBytesSync(16))
    let mostSiginficativeHexAsInt = parseInt(hexString[0], 16)
    if (mostSiginficativeHexAsInt < 8) {
        return hexString
    }

    mostSiginficativeHexAsInt -= 8
    return mostSiginficativeHexAsInt.toString() + hexString.substring(1)
}

function getOptions(options: Partial<ltcOptions>): ltcOptions{
    const result = {...DEFAULT_OPTIONS, ...options}
    result.ca = {...DEFAULT_OPTIONS.ca, ...result.ca}
    if (!result.path.endsWith('/')) {
        result.path += '/'
    }
    return result
}
function getPaths(settings: ltcOptions){
    const ca = `${settings.path}${settings.ca.filename}`
    const cert = `${settings.path}${settings.ca.filename}`
    return {
        caCrt: Path.parse(`${ca}${EXT_CERT}`),
        caKey: Path.parse(`${ca}${EXT_KEY}`),
        certCrt: Path.parse(`${cert}${EXT_CERT}`),
        certKey: Path.parse(`${cert}${EXT_KEY}`),
    }
}

function isCertificateValid({validity}: pki.Certificate): boolean{
    // TODO:
    // . check if maybe new validity duration setting invalidates certificate
    const now = new Date()
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)
    now.setMilliseconds(0)
    return validity.notBefore <= now && now <= validity.notAfter
}

function createCertificate(options: ltcCertOptions): {
    cert: pki.Certificate
    keys: pki.KeyPair
}{
    const keys = pki.rsa.generateKeyPair(options.keySize)
    const cert = pki.createCertificate()
    cert.publicKey = keys.publicKey
    cert.serialNumber = randomSerialNumber()

    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + options.validity)

    cert.setSubject(options.subject)
    cert.setIssuer(options.issuer)
    cert.setExtensions(options.extensions)

    const signingKey = options.signingKey || keys.privateKey
    cert.sign(signingKey, md.sha256.create())

    return {cert, keys}
}

class LocalTrustChain {
    readonly settings: ltcOptions
    readonly paths: ReturnType<typeof getPaths>
    caCrt: ReturnType<typeof loadCertificate>
    caKey: ReturnType<typeof loadPrivateKey>
    certCrt: ReturnType<typeof loadCertificate>
    certKey: ReturnType<typeof loadPrivateKey>

    constructor(options?: Partial<ltcOptions>){
        this.settings = getOptions(options)
        this.paths = getPaths(this.settings)
        this.loadFiles()
        this.createCertificates()
    }

    private loadFiles(){
        this.caCrt = loadCertificate(this.paths.caCrt)
        this.caKey = loadPrivateKey(this.paths.caKey, this.settings.ca.passphrase)
        this.certCrt = loadCertificate(this.paths.certCrt)
        this.certKey = loadPrivateKey(this.paths.certKey)
    }

    private createCertificates(){
        this.newCaCertificateNeeded && this.createCaCertificate()
        this.newLocalCertificateNeeded && this.createLocalCertificate()
    }

    private get newCaCertificateNeeded(): boolean{
        return !(this.caCrt || isCertificateValid(this.caCrt))
    }

    private get newLocalCertificateNeeded(): boolean{
        // TODO:
        // . check subjectAltName
        return !(this.certCrt || isCertificateValid(this.certCrt))
    }

    private createCaCertificate(): void{
        const {keySize, validity} = this.settings.ca
        const {cert, keys} = createCertificate({
            subject: ATTRS_CA,
            issuer: ATTRS_CA,
            extensions: EXTENSIONS_CA,
            keySize,
            validity,
        })

        this.caCrt = cert
        this.caKey = keys.privateKey

        saveCertificate(this.paths.caCrt, cert)
        savePrivateKey(this.paths.caKey, keys.privateKey, this.settings.ca.passphrase)
    }

    private createLocalCertificate(): void{
        const {keySize, validity} = this.settings.ca
        const {cert, keys} = createCertificate({
            subject: ATTRS_CERT,
            issuer: this.caCrt.subject.attributes,
            extensions: [
                ...EXTENSIONS_CERT,
                {
                    name: 'authorityKeyIdentifier',
                    keyIdentifier: (this.caCrt as any).generateSubjectKeyIdentifier().getBytes(),
                },
                {
                    name: 'subjectAltName',
                    altNames: [
                        {type: 2, value: 'localhost'},
                        {type: 7, ip: '127.0.0.1'},
                        {type: 7, ip: internalIp.v4.sync()},
                    ],
                },
            ],
            signingKey: this.caKey,
            keySize,
            validity,
        })

        this.certCrt = cert
        this.certKey = keys.privateKey
        // saveCertificate(this.paths.certCrt, cert)
        // savePrivateKey(this.paths.certKey, keys.privateKey)
    }

    get pem(): {
        key: pki.PEM
        cert: pki.PEM
        ca: pki.PEM
        }{
        return {
            key: pki.certificateToPem(this.certCrt),
            cert: pki.privateKeyToPem(this.certKey),
            ca: pki.certificateToPem(this.caCrt),
        }
    }
}

export default function init(options?: Partial<ltcOptions>){
    const {pem} = new LocalTrustChain(options)
    return pem
}
