const axios = require('axios').default
const assert = require('chai').assert
const fs =  require('fs')
const sinon = require('sinon')

// Mocking data libraries.
const mockData = require('./mocks/bchjs-mocks')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const BCHJS = require('../src/lib/bch')
const bchjs = new BCHJS()

const WALLET_NAME = 'wallet-test'
const WALLET_PATH = `${__dirname}/../config/${WALLET_NAME}`
const deleteFile = filepath => {
    try {
      // Delete state if exist
      fs.unlinkSync(filepath)
    } catch (error) {
        console.log("ERROR",error)
    }
  }
  


describe('#BCH', async function () {
    let sandbox

    before(async () => {
        deleteFile(`${WALLET_PATH}.json`)
    })

    // Restore the sandbox before each test.
    beforeEach(() => (sandbox = sinon.createSandbox()))

    afterEach(() => sandbox.restore())


    describe('getPrice', () => {
        it('should get bch price in usd', async () => {
            try {
                sandbox
                    .stub(bchjs.axios, 'request')
                    .resolves(mockData.rates1)

                const result = await bchjs.getPrice()
                //console.log(`result : ${JSON.stringify(result)}`)
                assert.isString(result)

            } catch (err) {
                assert(false, 'Unexpected result')

            }
        })


        it('Should throw error if fetch status is different than 200', async () => {

            try {
                sandbox
                    .stub(bchjs.axios, 'request')
                    .resolves(mockData.rates2)

                await bchjs.getPrice()
                assert(false, 'Unexpected result')

            } catch (err) {
                assert.include(
                    err.message,
                    "Error getting rates price"
                )

            }
        })
    })

    describe('createWallet', () => {
        it('Should throw error if wallet name is not provided', async () => {

            try {

                await bchjs.createWallet()
                assert(false, 'Unexpected result')

            } catch (err) {
                assert.include(
                    err.message,
                    "Wallet name must be a string"
                )

            }
        })
        it('Should create wallet', async () => {

            try {

                const walletData = await bchjs.createWallet(WALLET_PATH)
                assert.hasAllKeys(walletData,
                    [
                      'mnemonic',
                      'cashAddress',
                      'legacyAddress',
                      'WIF',
                      'network',
                      'nextAddress',
                      'derivation',
                      'addresses'
                    ]
                  )
                assert.isString(walletData.mnemonic)
                assert.isString(walletData.cashAddress)
                assert.isString(walletData.legacyAddress)
                assert.isString(walletData.WIF)
                assert.isString(walletData.network)
                assert.isString(walletData.derivation)
                assert.isNumber(walletData.nextAddress)
                assert.isArray(walletData.addresses)

            } catch (err) {
                throw err
                //assert(false, 'Unexpected result')

            }
        })
        it('Should throw error if wallet already exist', async () => {

            try {

                await bchjs.createWallet(WALLET_PATH)
                assert(false, 'Unexpected result')


            } catch (err) {
                assert.include(
                    err.message,
                    "Wallet name already exist"
                )

            }
        })
    })

    describe('bchToSatoshis', () => {
        it('Should throw error if bch  is not provided', async () => {

            try {   

                await bchjs.bchToSatoshis()
                
                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "bch must be a number"
                )

            }
        })
        it('Should convert bch to satoshis', async () => {

            try {   
                const bch = 1
                const result = await bchjs.bchToSatoshis(bch)
                assert.isNumber(result)
                assert.equal(result , 100000000)
            } catch (err) {
                assert(false, 'Unexpected result')

            }
        })
 
    })
})
