import {pki, md} from 'node-forge'
import {randomSerialNumber} from './files'

export function isCertificateValid({validity}: pki.Certificate): boolean{
    // TODO:
    // . check if maybe new validity duration setting invalidates certificate
    const now = new Date()
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)
    now.setMilliseconds(0)
    return validity.notBefore <= now && now <= validity.notAfter
}

export function createCertificate(options: ltcCertOptions): {
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
