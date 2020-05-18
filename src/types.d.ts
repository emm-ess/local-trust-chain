import {pki} from 'node-forge'

declare type ltcCertOptions = {
    subject: pki.CertificateField[]
    issuer: pki.CertificateField[]
    keySize: 2048 | 4096
    signingKey?: pki.PrivateKey
    validity: number
    extensions: any[]
}

declare type ltcOptions = {
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
