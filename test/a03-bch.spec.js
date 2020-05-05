const axios = require('axios').default
const assert = require('chai').assert
const fs = require('fs')
const sinon = require('sinon')

// Mocking data libraries.
const mockData = require('./mocks/bchjs-mocks')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const BCHJSLIB = require('../src/lib/bch')
const bchjsLib = new BCHJSLIB()

const WALLET_NAME = 'wallet-test'
const WALLET_PATH = `${__dirname}/../config/${WALLET_NAME}`
const deleteFile = filepath => {
    try {
        // Delete state if exist
        fs.unlinkSync(filepath)
    } catch (error) {
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
                    .stub(bchjsLib.axios, 'request')
                    .resolves(mockData.rates1)

                const result = await bchjsLib.getPrice()
                //console.log(`result : ${JSON.stringify(result)}`)
                assert.isString(result)

            } catch (err) {
                assert(false, 'Unexpected result')

            }
        })


        it('Should throw error if fetch status is different than 200', async () => {

            try {
                sandbox
                    .stub(bchjsLib.axios, 'request')
                    .resolves(mockData.rates2)

                await bchjsLib.getPrice()
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

                await bchjsLib.createWallet()
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

                const walletData = await bchjsLib.createWallet(WALLET_PATH)
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

                await bchjsLib.createWallet(WALLET_PATH)
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
        it('Should throw error if bch parameter is not provided', async () => {

            try {

                await bchjsLib.bchToSatoshis()

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
                const result = await bchjsLib.bchToSatoshis(bch)
                assert.isNumber(result)
                assert.equal(result, 100000000)
            } catch (err) {
                assert(false, 'Unexpected result')

            }
        })

    })

    describe('getBalance()', () => {
        it('Should throw error if bch address is not provided', async () => {

            try {

                await bchjsLib.getBalance()

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "addr must be a string"
                )

            }
        })


    })
    describe('getUtxos()', () => {
        it('Should throw error if bch address is not provided', async () => {

            try {

                await bchjsLib.getUtxos()

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "addr must be a string"
                )

            }
        })
    })

    describe('changeAddrFromMnemonic()', () => {
        it('Should throw error if hd index is not provided', async () => {

            try {

                await bchjsLib.changeAddrFromMnemonic()

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "index must be a non-negative integer"
                )

            }
        })
    })
    describe('isValidUtxo()', () => {

    })

    describe('sendAllAddr()', () => {
        it('Should throw error if fromAddr parameter is not provided', async () => {

            try {

                await bchjsLib.sendAllAddr()

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "fromAddr must be a string"
                )

            }
        })
        it('Should throw error if hd index parameter is not provided', async () => {

            try {
                const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
                await bchjsLib.sendAllAddr(fromAddr)

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "hdIndex must be a number"
                )

            }
        })
        it('Should throw error if toAddr parameter is not provided', async () => {

            try {
                const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
                const hdIndex = 1
                await bchjsLib.sendAllAddr(fromAddr, hdIndex)

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "toAddr must be a string"
                )

            }
        })
        describe('broadcastTx()', () => {
            it('Should throw error if hex parameter is not provided', async () => {

                try {

                    await bchjsLib.broadcastTx()

                    assert(false, 'Unexpected result')
                } catch (err) {
                    assert.include(
                        err.message,
                        "hex must be a string"
                    )

                }
            })
        })

        describe('generateTransaction()', () => {
            it('Should throw error if hd Index is not provided', async () => {

                try {

                    await bchjsLib.generateTransaction()

                    assert(false, 'Unexpected result')
                } catch (err) {
                    assert.include(
                        err.message,
                        "hdIndex must be a number"
                    )

                }
            })
        })
    })

    describe('getElectrumxBalance()', () => {
        it('Should throw error if address is not provided', async () => {

            try {

                await bchjsLib.getElectrumxBalance()

                assert(false, 'Unexpected result')
            } catch (err) {
                assert.include(
                    err.message,
                    "address must be a string"
                )

            }
        })
        it('Should return balance ', async () => {

            try {

                sandbox
                    .stub(bchjsLib.bchjs.Electrumx, 'balance')
                    .resolves(mockData.electrumxBalance)


                const addr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
                const balanceResult = await bchjsLib.getElectrumxBalance(addr)
               

                assert.property(balanceResult,'success')    
                assert.property(balanceResult,'balance')   

                assert.property(balanceResult.balance,'confirmed') 
                assert.property(balanceResult.balance,'unconfirmed') 

                assert.isBoolean(balanceResult.success) 
                   
                assert.isNumber(balanceResult.balance.confirmed)    
                assert.isNumber(balanceResult.balance.unconfirmed)   



            } catch (err) {

                assert(false, 'Unexpected result')


            }
        })

    })
})
