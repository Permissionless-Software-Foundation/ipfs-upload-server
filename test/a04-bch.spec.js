// const axios = require('axios').default
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

const File = require('../src/models/files')

const deleteFile = filepath => {
  try {
    // Delete state if exist
    fs.unlinkSync(filepath)
  } catch (error) { }
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
        sandbox.stub(bchjsLib.axios, 'request').resolves(mockData.rates1)

        const result = await bchjsLib.getPrice()
        // console.log(`result : ${JSON.stringify(result)}`)
        assert.isString(result)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })

    it('Should throw error if fetch status is different than 200', async () => {
      try {
        sandbox.stub(bchjsLib.axios, 'request').resolves(mockData.rates2)

        await bchjsLib.getPrice()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Error getting rates price')
      }
    })
  })

  describe('createWallet', () => {
    it('Should throw error if wallet name is not provided', async () => {
      try {
        await bchjsLib.createWallet()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Wallet name must be a string')
      }
    })
    it('Should create wallet', async () => {
      try {
        const walletData = await bchjsLib.createWallet(WALLET_PATH)
        assert.hasAllKeys(walletData, [
          'mnemonic',
          'cashAddress',
          'legacyAddress',
          'WIF',
          'network',
          'nextAddress',
          'derivation',
          'addresses'
        ])
        assert.isString(walletData.mnemonic)
        assert.isString(walletData.cashAddress)
        assert.isString(walletData.legacyAddress)
        assert.isString(walletData.WIF)
        assert.isString(walletData.network)
        assert.isString(walletData.derivation)
        assert.isNumber(walletData.nextAddress)
        assert.isArray(walletData.addresses)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
    it('Should throw error if wallet already exist', async () => {
      try {
        await bchjsLib.createWallet(WALLET_PATH)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Wallet name already exist')
      }
    })
  })

  describe('bchToSatoshis', () => {
    it('Should throw error if bch parameter is not provided', async () => {
      try {
        await bchjsLib.bchToSatoshis()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'bch must be a number')
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

  describe('getUtxos()', () => {
    it('Should throw error if bch address is not provided', async () => {
      try {
        await bchjsLib.getUtxos()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'addr must be a string')
      }
    })

    it('Should get utxos', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockbook, 'utxo').resolves(mockData.utxos)

        const addr = 'bchtest:qqehd2dzdc7wlm9l0lxy7pswnnxwar9r9czrecx0g5'
        const result = await bchjsLib.getUtxos(addr)
        const utxo = result[0]

        assert.isArray(result)
        assert.property(utxo, 'txid')
        assert.property(utxo, 'vout')
        assert.property(utxo, 'value')
        assert.property(utxo, 'confirmations')
        assert.property(utxo, 'satoshis')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('changeAddrFromMnemonic()', () => {
    it('Should throw error if hd index is not provided', async () => {
      try {
        await bchjsLib.changeAddrFromMnemonic()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'index must be a non-negative integer')
      }
    })
    it('Should return change from mnemonic', async () => {
      try {
        const index = 1
        const result = await bchjsLib.changeAddrFromMnemonic(index)
        assert.property(result, 'keyPair')
        assert.property(result, 'index')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
  describe('isValidUtxo()', () => {
    it('Should throw error if utxos dont have  txid property', async () => {
      try {
        const utxo = {
          vout: 0
        }
        await bchjsLib.isValidUtxo(utxo)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'utxo does not have a txid property')
      }
    })
    it('Should throw error if utxos dont have vout property', async () => {
      try {
        const utxo = {
          txid:
            '4f8f9ff19acf3a1502204b561905d88c039b49b95bcb960bd02a4e4f211d9aaa'
        }
        await bchjsLib.isValidUtxo(utxo)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'utxo does not have a vout property')
      }
    })

    it('Should validate utxos', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockchain, 'getTxOut').resolves(null)

        const utxo = {
          txid:
            '4f8f9ff19acf3a1502204b561905d88c039b49b95bcb960bd02a4e4f211d9aaa',
          vout: 0
        }
        const result = await bchjsLib.isValidUtxo(utxo)
        assert.isBoolean(result)
        assert.isFalse(result)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('sendAllAddr()', () => {
    it('Should throw error if fromAddr parameter is not provided', async () => {
      try {
        await bchjsLib.sendAllAddr()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'fromAddr must be a string')
      }
    })
    it('Should throw error if hd index parameter is not provided', async () => {
      try {
        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        await bchjsLib.sendAllAddr(fromAddr)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'hdIndex must be a number')
      }
    })
    it('Should throw error if toAddr parameter is not provided', async () => {
      try {
        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const hdIndex = 1
        await bchjsLib.sendAllAddr(fromAddr, hdIndex)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'toAddr must be a string')
      }
    })
    it('Should throw error if utxos is invalid type', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockchain, 'getTxOut').resolves(null)

        sandbox.stub(bchjsLib.bchjs.Blockbook, 'utxo').resolves(1)

        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const toAddr = 'bchtest:qqehd2dzdc7wlm9l0lxy7pswnnxwar9r9czrecx0g5'
        const hdIndex = 1

        await bchjsLib.sendAllAddr(fromAddr, hdIndex, toAddr)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'utxos must be an array.')
      }
    })
    it('Should throw error if utxos is empty array', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockchain, 'getTxOut').resolves(null)

        sandbox.stub(bchjsLib.bchjs.Blockbook, 'utxo').resolves([])

        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const toAddr = 'bchtest:qqehd2dzdc7wlm9l0lxy7pswnnxwar9r9czrecx0g5'
        const hdIndex = 1

        await bchjsLib.sendAllAddr(fromAddr, hdIndex, toAddr)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No utxos found.')
      }
    })
    it('Should throw error if UTXOs is not valid', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockchain, 'getTxOut').resolves(null)

        sandbox.stub(bchjsLib.bchjs.Blockbook, 'utxo').resolves(mockData.utxos)

        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const toAddr = 'bchtest:qqehd2dzdc7wlm9l0lxy7pswnnxwar9r9czrecx0g5'
        const hdIndex = 1

        await bchjsLib.sendAllAddr(fromAddr, hdIndex, toAddr)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Invalid UTXO detected. Wait for indexer to catch up.'
        )
      }
    })
    it('Should send all addrs', async () => {
      try {
        sandbox.stub(bchjsLib.bchjs.Blockchain, 'getTxOut').resolves(true)

        sandbox.stub(bchjsLib.bchjs.Blockbook, 'utxo').resolves(mockData.utxos)

        const fromAddr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const toAddr = 'bchtest:qqehd2dzdc7wlm9l0lxy7pswnnxwar9r9czrecx0g5'
        const hdIndex = 1

        const result = await bchjsLib.sendAllAddr(fromAddr, hdIndex, toAddr)

        assert.isString(result, 'Expected hex')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('broadcastTx()', () => {
    it('Should throw error if hex parameter is not provided', async () => {
      try {
        await bchjsLib.broadcastTx()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'hex must be a string')
      }
    })

    it('Should send the transaction', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.RawTransactions, 'sendRawTransaction')
          .resolves(mockData.txId)

        const hex = mockData.hex
        const result = await bchjsLib.broadcastTx(hex)

        assert.isArray(result)
        assert.isString(result[0])
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('generateTransaction()', () => {
    it('Should throw error if hd Index is not provided', async () => {
      try {
        await bchjsLib.generateTransaction()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'hdIndex must be a number')
      }
    })
  })
  describe('getElectrumxBalance()', () => {
    it('Should throw error if address is not provided', async () => {
      try {
        await bchjsLib.getElectrumxBalance()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'address must be a string')
      }
    })
    it('Should return balance ', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.Electrumx, 'balance')
          .resolves(mockData.PositiveElectrumxBalance)

        const addr = 'bchtest:qrf2xushgcegglz5dp8pekfayr0dhdx54q0zr0nnus'
        const balanceResult = await bchjsLib.getElectrumxBalance(addr)

        assert.property(balanceResult, 'success')
        assert.property(balanceResult, 'balance')

        assert.property(balanceResult.balance, 'confirmed')
        assert.property(balanceResult.balance, 'unconfirmed')

        assert.isBoolean(balanceResult.success)

        assert.isNumber(balanceResult.balance.confirmed)
        assert.isNumber(balanceResult.balance.unconfirmed)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
  describe('queueTransaction()', () => {
    it('Should throw error if hdIndex is not provided', async () => {
      try {
        await bchjsLib.queueTransaction()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'hdIndex must be a number')
      }
    })
  })
  describe('checkPaidFile()', () => {
    it('Should throw error if fileId property is not included', async () => {
      try {
        await bchjsLib.checkPaidFile()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'fileId is required')
      }
    })
    it('Should throw an error if the file doesnt exist', async () => {
      try {
        await bchjsLib.checkPaidFile(123456)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Cast to ObjectId failed')
      }
    })
    it('Should not update the file model if the balance is less than the hosting cost', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.Electrumx, 'balance')
          .resolves(mockData.NegativeElectrumxBalance)

        const files = await File.find({ hasBeenPaid: false })

        const file = files[0]

        await bchjsLib.checkPaidFile(file._id)

        const file2 = await File.findById(file._id)

        assert.property(file2, 'hasBeenPaid')
        assert.property(file2, 'payloadLink')

        assert.isFalse(file2.hasBeenPaid)
        assert.isString(file2.payloadLink)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })

    it('Should update the file model if the balance is greater than the hosting cost', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.Electrumx, 'balance')
          .resolves(mockData.PositiveElectrumxBalance)

        sandbox.stub(bchjsLib, 'uploadToTemporal').resolves('test-hash')

        const files = await File.find({ hasBeenPaid: false })

        const file = files[0]

        await bchjsLib.checkPaidFile(file._id)

        const file2 = await File.findById(file._id)

        assert.property(file2, 'hasBeenPaid')
        assert.property(file2, 'payloadLink')

        assert.isTrue(file2.hasBeenPaid)
        assert.isString(file2.payloadLink)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
  describe('paymentsSweep()', () => {
    it('Should not update the file model if the balance is less than the hosting cost', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.Electrumx, 'balance')
          .resolves(mockData.NegativeElectrumxBalance)

        const files = await File.find({ hasBeenPaid: false })

        const file = files[0]

        await bchjsLib.paymentsSweep()

        const file2 = await File.findById(file._id)

        assert.property(file2, 'hasBeenPaid')
        assert.isFalse(file2.hasBeenPaid)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })

    it('Should update the file model if the balance is greater than the hosting cost', async () => {
      try {
        sandbox
          .stub(bchjsLib.bchjs.Electrumx, 'balance')
          .resolves(mockData.PositiveElectrumxBalance)

        sandbox.stub(bchjsLib, 'uploadToTemporal').resolves('test-hash')

        const files = await File.find({ hasBeenPaid: false })

        const file = files[0]

        await bchjsLib.paymentsSweep()

        const file2 = await File.findById(file._id)

        assert.property(file2, 'hasBeenPaid')
        assert.isTrue(file2.hasBeenPaid)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
})
