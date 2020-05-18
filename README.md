# Local Trust Chain
DO NOT USE THIS IN PRODUCTION (it's not tested at all at the moment and it aim's development only - so security isn't a priority)!

Anyway. This is a small script generating a local certificate with the current local ip of your device as subjectAltName by - signed a local "root" certificate. Useful if you need a valid SSL-Certificate for your development-machine but have to access it from another machine. Having this in mind, the "root" certificate is saved on disk and thus can be added to your keychains.

## Usage
```javascript
const ltc = require('local-trust-chain');

const ltcOptions = {};

module.exports = {
    devServer: {
        open: true,
        https: ltc.init(ltcOptions),
    },
}
```

## Options
These are all options with their default value.
```javascript
const options = {
    // Path where root-certificate is stored.
    path: '~/.local-trust-chain/'
    // settings for the "root" certificate aka certificate authorization
    ca: {
        // the filename without extension
        filename: 'local-ca',
        // key can be either 2048 or 4096
        keySize: 2048,
        // duration of validity in days
        validity: 730,
        // should the root cert be written to disc
        saveToDisc: true,
        // optional the private key can be stored with a passphrase
        passphrase: undefined,
    }
    cert: {
        // key can be either 2048 or 4096
        keySize: 2048,
        // duration of validity in days
        validity: 730,
    }
};
```

## ToDos
[] ability to define a root certificate (making your local "root" an intermediate certificate)
[] option for writing certificate to disc
[] write tests
[] check passed options
