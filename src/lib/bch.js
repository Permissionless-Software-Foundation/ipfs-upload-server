
const axios = require('axios').default
const fs = require('fs')
const config = require('../../config')
const wlogger = require('./wlogger')



// REST API servers.
const MAINNET_API = 'https://api.fullstack.cash/v3/'
const TESTNET_API = 'https://tapi.fullstack.cash/v3/'

const NETWORK = config.network
const lang = 'english' // Set the language of the wallet.

const BCHJS = require('@chris.troutner/bch-js')
let bchjs
if (NETWORK === 'mainnet') bchjs = new BCHJS({ restURL: MAINNET_API })
else bchjs = new BCHJS({ restURL: TESTNET_API })




let _this
class BCH {
    constructor() {
        _this = this
        this.axios = axios
        this.bchjs = bchjs
        this.fs = fs
    }

    async getPrice() {
        try {
            const coinURL = 'https://api.coinbase.com/v2/exchange-rates?currency=BCH'
            const options = {
                method: 'GET',
                url: coinURL,
                headers: {
                    Accept: 'application/json',
                }
            }

            const result = await _this.axios.request(options)
            if (result.status !== 200)
                throw new Error("Error getting rates price")


            const USDperBCH = result.data.data.rates.USD

            return USDperBCH
        } catch (error) {
            wlogger.error('Error in lib/bch.js/getPrice()')

            throw error
        }



    }
    async bchToSatoshis(bch) {
        try {
            if (!bch || typeof bch !== 'number')
                throw new Error('bch must be a number')

            const satoshis = await _this.bchjs.BitcoinCash.toSatoshi(bch)

            return satoshis
        } catch (error) {
            wlogger.error('Error in lib/bch.js/bchToSatoshis()')
            throw error
        }
    }
    async  createWallet(walletName) {
        let outStr = ''
        const outObj = {}

        try {
            if (!walletName || typeof walletName !== 'string') {
                throw new Error('Wallet name must be a string')
            }

            // for validate if it exits wallet  or directory
            if (_this.fs.existsSync(`${walletName}.json`)) {
                throw new Error('Wallet name already exist')
            }

            // create 256 bit BIP39 mnemonic
            const mnemonic = _this.bchjs.Mnemonic.generate(
                128,
                _this.bchjs.Mnemonic.wordLists()[lang]
            )
            outStr += 'BIP44 $BCH Wallet\n'
            outStr += `\n128 bit ${lang} BIP32 Mnemonic:\n${mnemonic}\n\n`
            outObj.mnemonic = mnemonic

            // root seed buffer
            const rootSeed = await _this.bchjs.Mnemonic.toSeed(mnemonic)
            // console.log(`rootSeed: ${rootSeed}`)

            // master HDNode
            let masterHDNode
            if (NETWORK === 'mainnet') {
                outObj.network = 'mainnet'
                masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed)
            }
            else {
                outObj.network = 'testnet'
                masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet
            }
            outObj.derivation = '145'
            // HDNode of BIP44 account
            outStr += `BIP44 Account: "m/44\'/${outObj.derivation}\'/0\'"\n`
            const childNode = masterHDNode.derivePath(`m/44'/${outObj.derivation}'/0'/0/0`)
            outStr += `m/44'/145'/0'/0/0: ${_this.bchjs.HDNode.toCashAddress(
                childNode
            )}\n`

            outObj.cashAddress = _this.bchjs.HDNode.toCashAddress(childNode)
            outObj.legacyAddress = _this.bchjs.HDNode.toLegacyAddress(childNode)
            outObj.WIF = _this.bchjs.HDNode.toWIF(childNode)
            outObj.nextAddress = 1
            outObj.addresses = []
            // Write the extended wallet information into a text file.
            fs.writeFile(`${walletName}-info.txt`, outStr, function (err) {
                if (err) return console.error(err)

                console.log('wallet-info.txt written successfully.')
            })

            // Write out the basic information into a json file for other example apps to use.
            fs.writeFile(`${walletName}.json`, JSON.stringify(outObj, null, 2), function (err) {
                if (err) return console.error(err)
                console.log('wallet.json written successfully.')
            })
            return outObj
        } catch (err) {
            wlogger.error('Error in lib/bch.js/createWallet()')
            throw err
        }
    }

}

module.exports = BCH