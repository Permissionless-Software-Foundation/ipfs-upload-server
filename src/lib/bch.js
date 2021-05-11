// Public npm libraries
const axios = require('axios').default
const fs = require('fs')
const pRetry = require('p-retry')
const BchUtil = require('bch-util')

const config = require('../../config')
const wlogger = require('./wlogger')
const File = require('../models/files')

// REST API servers.
const MAINNET_API = 'https://api.fullstack.cash/v4/'
const TESTNET_API = 'https://tapi.fullstack.cash/v4/'

let NETWORK = config.network
const lang = 'english' // Set the language of the wallet.

// Instantiate the JWT handling library for FullStack.cash.
const JwtLib = require('jwt-bch-lib')
const jwtLib = new JwtLib({
  // Overwrite default values with the values in the config file.
  server: 'https://auth.fullstack.cash',
  login: process.env.FULLSTACKLOGIN,
  password: process.env.FULLSTACKPASS
})

// Textile Lib
const Textile = require('./textileio')
const textile = new Textile()

const BCHJS = require('@psf/bch-js')
let bchjs
if (NETWORK === 'mainnet') {
  bchjs = new BCHJS({
    restURL: MAINNET_API,
    apiToken: config.apiJwt
  })
} else {
  bchjs = new BCHJS({
    restURL: TESTNET_API,
    apiToken: config.apiJwt
  })
}

let walletInfo

if (config.env === 'test') {
  walletInfo = {
    mnemonic:
      'behind room vocal used bench ketchup smooth left maze imitate aware deputy',
    network: 'testnet',
    derivation: '145',
    cashAddress: 'bchtest:qz5c20agxjspn53z342glp6q08q4zzj8hqytpj3zln',
    legacyAddress: 'mvyJ7kbyVaQ43em6Vffpduu8twB9ssMFTC',
    WIF: 'cMijZGaQNs9MQPNcJXVj4GahVdwguo58sokiwSx7FviDA9X4oT83',
    nextAddress: 3
  }

  NETWORK = 'testnet'
}

let _this
class BCH {
  constructor () {
    _this = this
    this.axios = axios
    this.bchjs = bchjs
    this.fs = fs
    this.File = File
    this.pRetry = pRetry
    this.config = config
    this.TIMEOUT = 5000 // timeout between intervals when retrying transactions.
    this.bchUtil = new BchUtil({ bchjs })

    this.textile = textile

    // Renew the JWT token every 24 hours
    setInterval(async function () {
      wlogger.info('Updating FullStack.cash JWT token')
      await _this.getJwt()
    }, 60000 * 60 * 24)
    _this.getJwt()
  }

  // Get's a JWT token from FullStack.cash.
  // This code based on the jwt-bch-demo:
  // https://github.com/Permissionless-Software-Foundation/jwt-bch-demo
  async getJwt () {
    try {
      // Log into the auth server.
      await jwtLib.register()

      let apiToken = jwtLib.userData.apiToken

      // Ensure the JWT token is valid to use.
      const isValid = await jwtLib.validateApiToken()

      // Get a new token with the same API level, if the existing token is not
      // valid (probably expired).
      if (!isValid.isValid) {
        apiToken = await jwtLib.getApiToken(jwtLib.userData.apiLevel)
        wlogger.info('The JWT token was not valid. Retrieved new JWT token.\n')
      } else {
        wlogger.info('JWT token is valid.\n')
      }

      // Set the environment variable.
      process.env.BCHJSTOKEN = apiToken

      // Reinstantiate bchjs library so that it uses the new JWT token.
      if (config.network === 'testnet') {
        _this.bchjs = new BCHJS({ restURL: 'http://tapi.fullstack.cash/v4/' })
      } else {
        _this.bchjs = new BCHJS()
      }
    } catch (err) {
      wlogger.error('Error in bch.js/getJwt(): ', err)
      throw err
    }
  }

  async getPrice () {
    try {
      const coinURL = 'https://api.coinbase.com/v2/exchange-rates?currency=BCH'
      const options = {
        method: 'GET',
        url: coinURL,
        headers: {
          Accept: 'application/json'
        }
      }

      const result = await _this.axios.request(options)
      if (result.status !== 200) throw new Error('Error getting rates price')

      const USDperBCH = result.data.data.rates.USD

      return USDperBCH
    } catch (error) {
      wlogger.error('Error in lib/bch.js/getPrice()')

      throw error
    }
  }

  async bchToSatoshis (bch) {
    try {
      if (!bch || typeof bch !== 'number') {
        throw new Error('bch must be a number')
      }

      const satoshis = await _this.bchjs.BitcoinCash.toSatoshi(bch)

      return satoshis
    } catch (error) {
      wlogger.error('Error in lib/bch.js/bchToSatoshis()')
      throw error
    }
  }

  async createWallet (walletName) {
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
      } else {
        outObj.network = 'testnet'
        masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet
      }
      outObj.derivation = '145'
      // HDNode of BIP44 account
      outStr += `BIP44 Account: "m/44'/${outObj.derivation}'/0'"\n`
      const childNode = masterHDNode.derivePath(
        `m/44'/${outObj.derivation}'/0'/0/0`
      )
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
      fs.writeFile(
        `${walletName}.json`,
        JSON.stringify(outObj, null, 2),
        function (err) {
          if (err) return console.error(err)
          console.log('wallet.json written successfully.')
        }
      )
      return outObj
    } catch (err) {
      wlogger.error('Error in lib/bch.js/createWallet()')
      throw err
    }
  }

  // Retrieve the utxos for a given address from an indexer.
  // Current indexer used: Electrumx
  async getUtxos (addr) {
    try {
      if (!addr || typeof addr !== 'string') {
        throw new Error('addr must be a string')
      }
      // Convert to a cash address.
      const bchAddr = _this.bchjs.Address.toCashAddress(addr)
      // console.log(`bchAddr: ${bchAddr}`)

      // Get UTXOs associated with an address.
      const utxos = await _this.bchjs.Electrumx.utxo(bchAddr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      return utxos.utxos
    } catch (err) {
      wlogger.error('Error in bch.js/getUtxos()')

      throw err
    }
  }

  // Generate a change address from a Mnemonic of a private key.
  async changeAddrFromMnemonic (index) {
    try {
      if (!walletInfo.derivation) {
        throw new Error('walletInfo must have integer derivation value.')
      }
      // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

      // console.log(`index: ${index}`)

      if (typeof index !== 'number' || (!index && index !== 0)) {
        throw new Error('index must be a non-negative integer.')
      }

      // root seed buffer
      const rootSeed = await _this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)

      // master HDNode
      // master HDNode
      let masterHDNode
      if (NETWORK === 'mainnet') {
        masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed)
      } else {
        masterHDNode = _this.bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet
      }

      // HDNode of BIP44 account
      // console.log(`derivation path: m/44'/${walletInfo.derivation}'/0'`)
      const account = _this.bchjs.HDNode.derivePath(
        masterHDNode,
        `m/44'/${walletInfo.derivation}'/0'`
      )

      // derive the first external change address HDNode which is going to spend utxo
      const change = _this.bchjs.HDNode.derivePath(account, `0/${index}`)
      // console.log(`change: ${JSON.stringify(change, null, 2)}`)
      return change
    } catch (err) {
      wlogger.error('Error in bch.js/changeAddrFromMnemonic()')
      throw err
    }
  }

  // Call the full node to validate that UTXO has not been spent.
  // Returns true if UTXO is unspent.
  // Returns false if UTXO is spent.
  async isValidUtxo (utxo) {
    try {
      // Input validation.
      if (!utxo.tx_hash) {
        throw new Error('utxo does not have a tx_hash property')
      }
      if (!utxo.tx_pos && utxo.tx_pos !== 0) {
        throw new Error('utxo does not have a tx_pos property')
      }

      // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

      const txout = await _this.bchjs.Blockchain.getTxOut(
        utxo.tx_hash,
        utxo.tx_pos
      )
      // console.log(`txout: ${JSON.stringify(txout, null, 2)}`)

      if (txout === null) return false
      return true
    } catch (err) {
      wlogger.error('Error in bch.js/validateUtxo()')
      throw err
    }
  }

  // Sends all funds from fromAddr to toAddr.
  // Throws an error if the address at hdIndex does not match fromAddr.
  async sendAllAddr (fromAddr, hdIndex, toAddr) {
    try {
      if (!fromAddr || typeof fromAddr !== 'string') {
        throw new Error('fromAddr must be a string')
      }

      if (!hdIndex || typeof hdIndex !== 'number') {
        throw new Error('hdIndex must be a number')
      }

      if (!toAddr || typeof toAddr !== 'string') {
        throw new Error('toAddr must be a string')
      }

      const utxos = await _this.getUtxos(fromAddr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      if (!Array.isArray(utxos)) throw new Error('utxos must be an array.')

      if (utxos.length === 0) throw new Error('No utxos found.')

      // instance of transaction builder
      let transactionBuilder
      if (NETWORK === 'mainnet') {
        transactionBuilder = new _this.bchjs.TransactionBuilder()
      } else {
        transactionBuilder = new _this.bchjs.TransactionBuilder('testnet')
      }

      let originalAmount = 0

      // Calulate the original amount in the wallet and add all UTXOs to the
      // transaction builder.
      for (var i = 0; i < utxos.length; i++) {
        const utxo = utxos[i]

        originalAmount = originalAmount + utxo.value

        transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos)
      }

      if (originalAmount < 1) {
        throw new Error('Original amount is zero. No BCH to send.')
      }

      // original amount of satoshis in vin
      // console.log(`originalAmount: ${originalAmount}`)

      // get byte count to calculate fee. paying 1 sat/byte
      const byteCount = _this.bchjs.BitcoinCash.getByteCount(
        { P2PKH: utxos.length },
        { P2PKH: 1 }
      )
      const fee = Math.ceil(1.1 * byteCount)
      // console.log(`fee: ${byteCount}`)

      // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
      const sendAmount = originalAmount - fee
      // console.log(`sendAmount: ${sendAmount}`)

      // add output w/ address and amount to send
      transactionBuilder.addOutput(
        _this.bchjs.Address.toLegacyAddress(toAddr),
        sendAmount
      )

      let redeemScript

      // Loop through each input and sign
      for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i]

        // Validte the UTXO before trying to spend it.
        const isValid = await _this.isValidUtxo(utxo)
        if (!isValid) {
          throw new Error(
            'Invalid UTXO detected. Wait for indexer to catch up.'
          )
        }

        // Generate a keypair for the current address.
        const change = await _this.changeAddrFromMnemonic(hdIndex)
        const keyPair = _this.bchjs.HDNode.toKeyPair(change)

        transactionBuilder.sign(
          i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          utxo.value
        )
      }

      // build tx
      const tx = transactionBuilder.build()

      // output rawhex
      const hex = tx.toHex()
      // console.log(`Transaction raw hex: ${hex}`)

      return hex
    } catch (err) {
      wlogger.error('Error in bch.js/sendAllAddr()')
      console.error('Error in bch.js/sendAllAddr(): ', err)

      // console.error(err)
      throw err
    }
  }

  // Broadcasts the transaction to the BCH network.
  // Expects a hex-encoded transaction generated by sendBCH(). Returns a TXID
  // or throws an error.
  async broadcastTx (hex) {
    try {
      if (!hex || typeof hex !== 'string') {
        throw new Error('hex must be a string')
      }

      const txid = await _this.bchjs.RawTransactions.sendRawTransaction([hex])
      // console.log(`txid: ${JSON.stringify(txid, null, 2)}`)

      return txid
    } catch (err) {
      wlogger.error('Error in bch.js/broadcastTx()')

      throw err
    }
  }

  // Generates and broadcasts a transaction to sweep funds from a users wallet.
  async generateTransaction (hdIndex) {
    // console.log(`generating transaction for index ${hdIndex}`)
    try {
      if (!hdIndex || typeof hdIndex !== 'number') {
        throw new Error('hdIndex must be a number')
      }

      // Generate the public address from the hdIndex.
      const change = await _this.changeAddrFromMnemonic(hdIndex)
      const addr = _this.bchjs.HDNode.toCashAddress(change)
      // console.log(`addr: ${JSON.stringify(addr, null, 2)}`)

      // Generate the hex for the transaction.
      const hex = await _this.sendAllAddr(addr, hdIndex, config.companyAddr)

      // Broadcast the transaction
      // return hex
      const txid = await _this.broadcastTx(hex)

      return txid
    } catch (err) {
      // If the error is anything other than 'no utxos found', then add
      // the transaction back into the queue to try again later.
      if (
        err.message &&
        (err.message.indexOf('No utxos found') > -1 ||
          err.message.indexOf('Invalid UTXO detected') > -1)
      ) {
        throw new pRetry.AbortError('No utxos found.')
      }

      // Corner case handles when someone sends the app dust.
      if (!err.message && err.error && err.error.includes('dust')) {
        return 'dust'
      }

      // Handle other non-error errors.
      if (!err.message && err.error) throw new Error(err.error)

      // console.error(`Error in generateTransaction: ${err.message}`)
      console.error('Error in generateTransaction: ', err)
      throw err
    }
  }

  // Adds an HD index value to the queue.
  // The queue will sweep all funds from an address of the apps HD wallet, using
  // the hdIndex, and send those funds to the company wallet.
  // If the transaction fails, it will be retried until it succeeds.
  async queueTransaction (hdIndex) {
    // console.log(`hdIndex: ${hdIndex}`)
    try {
      if (!hdIndex || typeof hdIndex !== 'number') {
        throw new Error('hdIndex must be a number')
      }

      // Wrap the call to generateTransaction into an async function.
      const run = async () => _this.generateTransaction(hdIndex)

      // Generate a transaction and try 5 times on failure.
      const txid = await pRetry(run, {
        onFailedAttempt: async error => {
          // Log failed attempt.
          console.log(
            `Attempt ${error.attemptNumber} to sweep HD index ${hdIndex} failed. There are ${error.retriesLeft} retries left. Waiting ${_this.TIMEOUT} milliseconds.`
          )
          _this.sleep(_this.TIMEOUT)
        },
        retries: 5
      })

      return txid
    } catch (err) {
      wlogger.error('Error in bch.js/queueTransaction()')
      throw err
    }
  }

  async getElectrumxBalance (address) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('address must be a string')
      }
      console.log(`address: ${address}`)

      const balance = await _this.bchjs.Electrumx.balance(address)
      return balance
    } catch (error) {
      wlogger.error('Error in bch.js/getElectrumxBalance()')
      console.log(`_this.bchjs.restURL: ${_this.bchjs.restURL}`)

      throw error
    }
  }

  // Verifies the associated balances to the file's bch address
  // Verifies that the balance meets the hosting cost of each file
  // to proceed with the sweep of said address
  async paymentsSweep () {
    try {
      // Open wallet file for development or production.
      walletInfo = require(`${__dirname}/../../config/wallet.json`)

      if (!walletInfo) {
        throw new Error('wallet.json is required')
      }

      // Debug log
      const sweepInfo = {
        unpaid: 0,
        paid: 0,
        withBalance: 0
      }

      // Get unpaid files from db
      const files = await _this.File.find({ hasBeenPaid: false })
      // console.log(`unpaid files: ${JSON.stringify(files, null, 2)}`)

      if (!files.length) {
        console.log('No unpaid files found')
        return
      }
      // console.log(`Unpaid files: ${files.length}`)

      // Update the stats object.
      sweepInfo.unpaid = files.length

      // Scan the blockchain for paid files, return an array of the files that
      // have recieved a payment.
      const paidFiles = await this.scanForPaidFiles(files)

      // Iterate over the paid files.
      for (let i = 0; i < paidFiles.length; i++) {
        const file = paidFiles[i]
        console.log(`file: ${JSON.stringify(file, null, 2)}`)

        let txId

        // Handle unit tests differently.
        if (config.env === 'test') txId = 'test transaction id'
        // Production. Queue the sweep transaction to send the funds to the company wallet
        else txId = await _this.queueTransaction(file.walletIndex)

        console.log(`txId: ${txId}`)

        // Update file model into db
        // File has been marked as paid
        if (txId) {
          const textileHash = await _this.bucketPushPath(file.fileName)

          // console.log(
          //  `File can be downloaded from: https://gateway.temporal.cloud/ipfs/${temporalHash}`
          // )

          // Write the data to the logs.
          wlogger.info(`TXID ${txId} paid for IPFS file ${textileHash}`)

          // Asigning file as paid
          file.hasBeenPaid = true
          file.payloadLink = textileHash

          // Update the model in the database.
          await file.save()

          sweepInfo.paid++
          sweepInfo.unpaid--
        }
      }

      // console.log(`Sweep Info : ${JSON.stringify(sweepInfo)}`)
      console.log(`Total unpaid files: ${sweepInfo.unpaid}`)
      if (sweepInfo) {
        console.log(`Paid files found in this pass: ${sweepInfo.paid}`)
      }
      // console.log(`Addresses found with a balance (that was swept): ${sweepInfo.withBalance}`)
    } catch (error) {
      wlogger.error('Error in bch.js/paymentsSweep(): ', error)
      // console.log(`config.network: ${config.network}`)
      // console.log(`process.env.NETWORK: ${process.env.NETWORK}`)
    }
  }

  // Check to see if any of the unpaid files listed in the database have been paid.
  // Expects an array of file objects as input (from the Mongo database).
  // Returns an array of file models that have been paid. Array will be empty if
  // no payments are found.
  async scanForPaidFiles (files) {
    try {
      // By default, return an empty array.
      const paidFiles = []

      // Chunk the list of files into an array of 20-element arrays.
      const chunkedFiles = this.bchUtil.util.chunk20(files)
      // Loop through each chunk (of 20 files/BCH addresses).
      for (let i = 0; i < chunkedFiles.length; i++) {
        const thisChunk = chunkedFiles[i]

        // Extract just the BCH addresses.
        const addresses = thisChunk.map(elem => elem.bchAddr)

        // Get the BCH balance for each address in the chunk.
        const rawBalances = await this.bchjs.Electrumx.balance(addresses)
        // console.log(`rawBalances: ${JSON.stringify(rawBalances, null, 2)}`)

        // Loop through the list of balances.
        for (let j = 0; j < rawBalances.balances.length; j++) {
          const thisAddr = rawBalances.balances[j]
          const thisFile = thisChunk[j]

          // Add the confirmed and unconfirmed balances.
          const totalBalance =
            thisAddr.balance.confirmed + thisAddr.balance.unconfirmed

          // Add the file to the paidFiles array if the hosting costs have been paid.
          if (totalBalance > 0 && totalBalance >= thisFile.hostingCost) {
            // Mark how much BCH there is in the address to be swept. (It might be
            // different than the required hosting cost.)
            thisFile.bchToSweep = totalBalance

            // Add the file object to the array of paid files.
            paidFiles.push(thisFile)
          }
        }
      }

      return paidFiles
    } catch (err) {
      wlogger.error('Error in scanForPaidFiles(): ', err)
      throw err
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Verifies the balance of an specific file a check it as
  // paid if cover the hosting fee
  async checkPaidFile (fileId) {
    try {
      if (!fileId) {
        throw new Error('fileId is required')
      }
      // Open wallet file for development or production.
      walletInfo = require(`${__dirname}/../../config/wallet.json`)
      if (!walletInfo) {
        throw new Error('wallet.json is required')
      }

      const file = await _this.File.findById(fileId)
      if (!file) {
        throw new Error(' File not found')
      }

      // return file data if its paid and hosted
      if (file.hasBeenPaid && file.payloadLink) return file

      const addr = file.bchAddr
      const resultBalance = await _this.getElectrumxBalance(addr)
      if (!resultBalance.success) {
        throw new Error(`Failed to get balance for address ${addr}`)
      }

      const balance = resultBalance.balance
      const totalBalance = balance.confirmed + balance.unconfirmed

      // Verifies if the total balance meets
      // the required hosting cost
      if (totalBalance > 0 && totalBalance >= file.hostingCost) {
        let txId
        if (config.env === 'test') txId = 'test transaction id'
        else txId = await _this.queueTransaction(file.walletIndex)

        // Update file model into db
        // File has been marked as paid
        if (txId) {
          const textileHash = await _this.bucketPushPath(file.fileName)
          // console.log(`temporalData: ${JSON.stringify(temporalData, null, 2)}`)
          // console.log(
          //   `File can be downloaded from: https://gateway.temporal.cloud/ipfs/${temporalHash}`
          // )

          file.hasBeenPaid = true
          file.payloadLink = textileHash

          await file.save()
        }
      }
      return file
    } catch (error) {
      console.error('Error in files/bch.js/checkPaidFile()')
      throw error
    }
  }

  // Upload a file to textileio.
  async bucketPushPath (fileName) {
    try {
      if (!fileName || typeof fileName !== 'string') {
        throw new Error('fileName must be a string')
      }
      console.log(`fileName: ${fileName}`)

      // Compute the relative file path to the file to be uploaded.
      const relFilePath = `${__dirname}/../../uppy-files/${fileName}`
      console.log(`relFilePath: ${relFilePath}`)

      // Auth to hub
      const { id } = await this.textile.authUser()
      // Init bucket
      const { buckets, bucketKey } = await this.textile.initBucket(id)

      // Get file buffer
      const buff = this.fs.createReadStream(relFilePath)

      // Push file
      const result = await this.textile.pushPath(
        buckets,
        bucketKey,
        buff,
        fileName
      )

      const { path } = result
      if (!path || !path.path) {
        throw new Error('Error trying to upload file')
      }
      console.log(`IPFS hash : ${path.path}`)
      // IPFS hash : /ipfs/bafybeidcwnkio5p32z3k3svjvk7arcxjxdkxgwczjhrbry2npun25coxga

      // Remove the '/ipfs/' preface to the hash.
      const hash = path.path.slice(6)

      return hash
    } catch (err) {
      console.error('Error in bch.js/bucketPushPath()')
      throw err
    }
  }
}

module.exports = BCH
