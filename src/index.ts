import {pki} from 'node-forge'
import {homedir, userInfo} from 'os'

import type {ltcCertOptions} from './util'
import {
    createCertificate,
    getPaths,
    isCertificateValid,
    loadCertificate,
    loadPrivateKey,
    saveCertificate,
    savePrivateKey,
} from './util'
import {getIPsAsAltNames} from './util/ip'

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

const USER_NAME = userInfo().username

const DEFAULT_OPTIONS: ltcOptions = {
    path: `${homedir()}/.local-trust-chain/`,
    ca: {
        filename: 'local-ca',
        keySize: 2048,
        validity: 730,
        saveToDisc: true,
    },
    cert: {
        filename: 'local',
        keySize: 2048,
        validity: 730,
    },
}

const ATTRS_CA = [
    {shortName: 'O', value: `${USER_NAME} organization`},
    {shortName: 'OU', value: USER_NAME},
    {shortName: 'CN', value: `${USER_NAME}-local-ca`},
]

const ATTRS_CERT = [
    {shortName: 'O', value: `${USER_NAME}-local-dev`},
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

function getOptions(options: Partial<ltcOptions>): ltcOptions {
    const result = {...DEFAULT_OPTIONS, ...options}
    result.ca = {...DEFAULT_OPTIONS.ca, ...result.ca}
    return result
}

class LocalTrustChain {
    readonly settings: ltcOptions
    readonly paths: ReturnType<typeof getPaths>
    caCrt: ReturnType<typeof loadCertificate>
    caKey: ReturnType<typeof loadPrivateKey>
    certCrt: ReturnType<typeof loadCertificate>
    certKey: ReturnType<typeof loadPrivateKey>

    constructor(options?: Partial<ltcOptions>) {
        this.settings = getOptions(options)
        this.paths = getPaths(this.settings)
        this.loadFiles()
        this.createCertificates()
    }

    private loadFiles(): void {
        this.caCrt = loadCertificate(this.paths.caCrt)
        this.caKey = loadPrivateKey(this.paths.caKey, this.settings.ca.passphrase)
        this.certCrt = loadCertificate(this.paths.certCrt)
        this.certKey = loadPrivateKey(this.paths.certKey)
    }

    private createCertificates(): void {
        this.newCaCertificateNeeded && this.createCaCertificate()
        this.newLocalCertificateNeeded && this.createLocalCertificate()
    }

    private get newCaCertificateNeeded(): boolean {
        return !(this.caCrt && isCertificateValid(this.caCrt))
    }

    private get newLocalCertificateNeeded(): boolean {
        // TODO:
        // . check subjectAltName
        return !(this.certCrt && isCertificateValid(this.certCrt))
    }

    private createCaCertificate(): void {
        const {keySize, validity, passphrase} = this.settings.ca
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
        savePrivateKey(this.paths.caKey, keys.privateKey, passphrase)
    }

    private createLocalCertificate(): void {
        const {keySize, validity} = this.settings.ca
        const keyIdentifier = pki.getPublicKeyFingerprint(this.caCrt.publicKey, {type: 'RSAPublicKey'}).getBytes()
        const {cert, keys} = createCertificate({
            subject: ATTRS_CERT,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            issuer: this.caCrt.issuer.attributes,
            extensions: [
                ...EXTENSIONS_CERT,
                {
                    name: 'authorityKeyIdentifier',
                    keyIdentifier,
                },
                {
                    name: 'subjectAltName',
                    altNames: [
                        {type: 2, value: 'localhost'},
                        ...getIPsAsAltNames(),
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
        } {
        return {
            cert: pki.certificateToPem(this.certCrt),
            key: pki.privateKeyToPem(this.certKey),
            ca: pki.certificateToPem(this.caCrt),
        }
    }
}

export = (options?: Partial<ltcOptions>): (typeof LocalTrustChain.prototype)['pem'] => (new LocalTrustChain(options)).pem
