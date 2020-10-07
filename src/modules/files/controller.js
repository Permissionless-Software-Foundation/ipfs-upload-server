/**
 * Controller class for file enpoints
 *
 * TODO:
 * - Throw an error if the file does not exist for the filename.
 */

const File = require('../../models/files')

const config = require('../../../config')
const BCHJS = require('../../lib/bch')
const bchjs = new BCHJS()

const GetAddress = require('slp-cli-wallet/src/commands/get-address')
const getAddress = new GetAddress()

const util = require('../../lib/utils/json-files')

let _this

class FileController {
  constructor () {
    _this = this
    this.File = File
    this.config = config
    this.bchjs = bchjs
    this.util = util
    this.getAddress = getAddress
  }

  /**
   * @api {post} /files Create a new File
   * @apiPermission public
   * @apiName CreateFile
   * @apiGroup Files
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{ "file": { "schemaVersion": 1 ,"timestamp":"utc"  } }' localhost:5001/files
   *
   * @apiParam {Object}  file File object (required)
   * @apiParam {Number}  file.schemaVersion (required)
   * @apiParam {String}  file.timestamp (required)
   * @apiParam {Number}  file.size (required)
   * @apiParam {String}  file.userId (optional)
   * @apiParam {Object}  file.meta (optional)
   *
   * @apiSuccess {Boolean}  success File creation status.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Path `schemaVersion` is required"
   *     }
   */

  async createFile (ctx) {
    try {
      const file = new _this.File(ctx.request.body.file)

      // Input Validation.
      if (!file.schemaVersion || typeof file.schemaVersion !== 'number') {
        throw new Error("Property 'schemaVersion' must be a number!")
      }
      if (!file.size || typeof file.size !== 'number') {
        throw new Error("Property 'size' must be a number!")
      }

      // These properties shouldn't be sent in the petition,
      // because they're created by the controller
      // TODO: force-replace these properties so that we can remove the error
      // handling.
      if (file.updateIndex) {
        throw new Error("Property 'updateIndex' not allowed!")
      }
      if (file.createdTimestamp) {
        throw new Error("Property 'createdTimestamp' not allowed!")
      }
      if (file.lastAccessed) {
        throw new Error("Property 'lastAccessed' not allowed!")
      }

      // Set update index to default
      file.updateIndex = 1

      // Set current time
      file.createdTimestamp = new Date().getTime() / 1000

      let walletPath
      let feeResult
      if (config.env === 'test') {
        feeResult = {
          SAT: 1,
          BCH: 1,
          USD: 1
        }

        walletPath = `${__dirname}/../../../config/wallet-test.json`
      } else {
        feeResult = await _this.getHostingFee(file.size)

        walletPath = `${__dirname}/../../../config/wallet.json`
      }

      file.hostingCost = feeResult.SAT

      // Get the HD index for the next wallet address.
      const walletData = await _this.util.readJSON(walletPath)
      // console.log(`walletData: ${JSON.stringify(walletData, null, 2)}`)
      file.walletIndex = walletData.nextAddress

      // Generate a BCH address for this user.
      file.bchAddr = await _this.getAddress.getAddress(walletPath)

      await file.save()

      const hostingCostBCH = feeResult.BCH
      const hostingCostUSD = Number(feeResult.USD.toFixed(2)) // Rounds and limit to 2 decimals

      ctx.body = {
        success: true,
        hostingCostBCH,
        hostingCostUSD,
        file
      }
    } catch (err) {
      console.log(err.message)
      ctx.throw(422, err.message)
    }
  }

  /**
   * @api {get} /files Get all files
   * @apiPermission user
   * @apiName GetFiles
   * @apiGroup Files
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/files
   *
   * @apiSuccess {Object[]}  file File object (required)
   * @apiSuccess {Number}  file.schemaVersion (required)
   * @apiSuccess {String}  file.timestamp (required)
   * @apiSuccess {Number}  file.size (required)
   * @apiSuccess {String}  file.userId (optional)
   * @apiSuccess {Object}  file.meta (optional)
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "file":[{
   *         "_id":"5dc65c1dafbe60187afe2bf5",
   *         "schemaVersion":1,
   *         "timestamp":"utc","__v":0
   *         }]
   *     }
   *
   */
  async getFiles (ctx) {
    try {
      const files = await _this.File.find({})

      ctx.body = { files }
    } catch (error) {
      ctx.throw(404)
    }
  }

  /**
   * @api {get} /file/:id Get file by id
   * @apiPermission user
   * @apiName GetFile
   * @apiGroup Files
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/files/5dc65c1dafbe60187afe2bf5
   *
   * @apiSuccess {Object}   file                    file object
   * @apiSuccess {ObjectId} file._id                file id
   * @apiSuccess {Number}   file.schemaVersion (required)
   * @apiSuccess {String}   file.timestamp (required)
   * @apiSuccess {Number}   file.size (required)
   * @apiSuccess {String}   file.userId (optional)
   * @apiSuccess {Object}   file.meta (optional)
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "file":[{
   *         "_id":"5dc65c1dafbe60187afe2bf5",
   *         "schemaVersion":1,
   *         "timestamp":"utc","__v":0
   *         }]
   *     }
   *
   */

  async getFile (ctx, next) {
    try {
      const file = await _this.File.findById(ctx.params.id)

      if (!file) {
        ctx.throw(404)
      }

      ctx.body = {
        file
      }
    } catch (err) {
      if (err === 404 || err.name === 'CastError') {
        ctx.throw(404)
      }

      ctx.throw(500)
    }

    if (next) {
      return next()
    }
  }

  /**
   * @api {put} /files/:id Update a file
   * @apiPermission user
   * @apiName UpdateFile
   * @apiGroup Files
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X PUT -d '{ "file": { "schemaVersion": 1 ,"meta":"test1" } }' localhost:5001/files/5df85d4bf1cedc505be61807
   *
   * @apiSuccess {Object}   file                    file object
   * @apiSuccess {ObjectId} file._id                file id
   * @apiSuccess {Number}   file.schemaVersion      file version
   * @apiSuccess {String}   file.createdTimestamp   Time file was uploaded
   * @apiSuccess {Number}   file.size (required) Size of the file in bytes
   * @apiSuccess {String}   file.payloadLink        IPFS hash of current file.
   * @apiSuccess {Object}   file.meta
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *   "file":[{
   *   "_id":"5df85d4bf1cedc505be61807",
   *   "schemaVersion":1,
   *   "timestamp":"utc","__v":0
   *   }]
   *  }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *{
   * "status": 401,
   * "error": "Unauthorized"
   *}
   *
   */
  async updateFile (ctx) {
    try {
      // Values obtain from user request.
      // This variable is intended to validate the properties
      // sent by the client
      const fileObj = ctx.request.body.file

      // values obtained from the search by file id
      const file = ctx.body.file
      // console.log(file)

      // Input validation
      if (fileObj.schemaVersion && typeof fileObj.schemaVersion !== 'number') {
        throw new Error("Property 'schemaVersion' must be a number!")
      }

      if (fileObj.size && typeof fileObj.size !== 'number') {
        throw new Error("Property 'size' must be a number!")
      }

      // This properties shouldn't be sent in the petition,
      // because they're created by the controller
      if (fileObj.updateIndex) {
        throw new Error("Property 'updateIndex' not allowed!")
      }
      if (fileObj.createdTimestamp) {
        throw new Error("Property 'createdTimestamp' not allowed!")
      }
      if (fileObj.lastAccessed) {
        throw new Error("Property 'lastAccessed' not allowed!")
      }

      Object.assign(file, fileObj)

      // Set current time
      file.lastAccessed = new Date().getTime()
      file.updateIndex = file.updateIndex + 1

      await file.save()

      ctx.body = {
        file
      }
    } catch (error) {
      ctx.throw(422, error.message)
    }
  }

  // calculate hosting fee
  async getHostingFee (fileBytes) {
    const feePerMB = _this.config.feePerMb // fee USD per MB
    try {
      if (!fileBytes || typeof fileBytes !== 'number') {
        throw new Error('fileBytes must be a number')
      }

      if (!feePerMB || typeof feePerMB !== 'number') {
        throw new Error('feePerMB config property must be a number')
      }

      // convert bytes to MB
      const fileKb = fileBytes / 1024
      const fileMb = fileKb / 1024
      // console.log(`fileMb : ${fileMb}`)

      let feeInUSD // file fee in usd
      // let feeInBCH // file fee in bch
      // let feeInSAT // file fee in satoshis

      if (fileMb <= 10) {
        feeInUSD = feePerMB * 10 // minimun fee is 0.01 USD
      } else {
        feeInUSD = feePerMB * fileMb
      }

      // Get bch price in USD
      const USDperBCH = await _this.bchjs.getPrice()
      // console.log(`USDperBCH : ${USDperBCH}`)

      // Calculating fees in bch
      const bchFee = feeInUSD / USDperBCH
      const feeInBCH = Number(bchFee.toFixed(8)) // Rounds and limit to 8 decimals

      // Calculating fees in satoshis
      const feeInSAT = await _this.bchjs.bchToSatoshis(bchFee)
      const feeData = {
        USD: feeInUSD,
        SAT: Math.floor(feeInSAT),
        BCH: feeInBCH
      }

      // console.log(`feeData : ${JSON.stringify(feeData)}`)

      return feeData
    } catch (error) {
      console.error('Error in files/controller.js/getHostingFee()')
      throw error
    }
  }

  // calculate hosting fee
  async checkPaidFile (ctx) {
    try {
      const file = await _this.bchjs.checkPaidFile(ctx.params.id)
      ctx.body = {
        file
      }
    } catch (err) {
      console.error('Error in files/controller.js/checkPaidFile()')
      if (err === 404 || err.name === 'CastError') {
        ctx.throw(404)
      }
      ctx.throw(500, err.message)
    }
  }
}

module.exports = FileController
