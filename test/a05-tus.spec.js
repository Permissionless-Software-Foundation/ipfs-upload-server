const assert = require('chai').assert
const fs = require('fs')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const TUSLIB = require('../src/lib/tus-node-server')
const tusLib = new TUSLIB()

const jsonFile = require('../src/lib/utils/json-files')

const File = require('../src/models/files')

const fileName = 'cleanUpTest'
const filePath = `${__dirname}/../uppy-files/${fileName}`

const createFile = async filepath => {
  const Obj = {
    test: 'cleanUpTest'
  }
  try {
    await jsonFile.writeJSON(Obj, filepath)
  } catch (error) {
    console.log(error)
    throw error
  }
}

const deleteFile = filepath => {
  try {
    // Delete state if exist
    fs.unlinkSync(filepath)
  } catch (error) { }
}

const addFileModelToDb = async file => {
  const fileModel = await new File(file)
  await fileModel.save()
  return fileModel
}

describe('#tus-node-server', async function () {
  before(async () => {
  })

  afterEach(() => deleteFile(filePath))

  describe('getDifferTime()', () => {
    it('Should throw error if date1 parameter is not provided', async () => {
      try {
        await tusLib.getDifferTime()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'date1 must be a Date() instance')
      }
    })
    it('Should throw error if date2 parameter is not provided', async () => {
      try {
        const date1 = new Date()
        await tusLib.getDifferTime(date1)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'date2 must be a Date() instance')
      }
    })
    it('Should return defferences between 2 date', async () => {
      try {
        const date1 = new Date('2020-05-21T10:10:10')// yyyy-mm-dd time
        const date2 = new Date('2020-05-22T10:10:10')// yyyy-mm-dd time

        const differences = await tusLib.getDifferTime(date1, date2)
        console.log(`differences : ${JSON.stringify(differences, null, 2)}`)

        assert.hasAnyKeys(differences, [
          'millisec',
          'seconds',
          'minutes',
          'hour',
          'days'
        ])
        assert.equal(differences.hours, 24)
        assert.equal(differences.days, 1)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('cleanUp()', () => {
    it('should delete files created more than 24 hours ago ', async () => {
      try {
        const fileModel = {
          schemaVersion: 1,
          createdTimestamp: new Date('2020-04-22T10:10:10') / 1000, // more than 24 hours
          size: 3498,
          fileName: fileName,
          hostingCost: 4246,
          walletIndex: 1,
          bchAddr: 'bchtest:qrcqp8ykwlhfeg9uart92ymw6q6wnwmpaclsf9krv9'
        }

        await createFile(filePath)
        const fileStored = await addFileModelToDb(fileModel)
        // console.log(`fileStored : ${JSON.stringify(fileStored, null, 2)}`)

        await tusLib.cleanUp()

        // Get file from db
        const fileUpdatedResult = await File.find({ _id: fileStored._id })
        // console.log(`fileUpdated : ${JSON.stringify(fileUpdatedResult, null, 2)}`)

        const fileUpdated = fileUpdatedResult[0]
        const existFile = fs.existsSync(filePath)

        assert.isTrue(fileUpdated.isArchived)
        assert.isFalse(existFile)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
    it('should not delete files created less than 24 hours ago', async () => {
      try {
        const fileModel = {
          schemaVersion: 1,
          createdTimestamp: new Date() / 1000, // less than 24 hours
          size: 3498,
          fileName: fileName,
          hostingCost: 4246,
          walletIndex: 1,
          bchAddr: 'bchtest:qrcqp8ykwlhfeg9uart92ymw6q6wnwmpaclsf9krv9'
        }

        await createFile(filePath)
        const fileStored = await addFileModelToDb(fileModel)
        // console.log(`fileStored : ${JSON.stringify(fileStored, null, 2)}`)

        await tusLib.cleanUp()

        // Get file from db
        const fileUpdatedResult = await File.find({ _id: fileStored._id })
        // console.log(`fileUpdated : ${JSON.stringify(fileUpdatedResult, null, 2)}`)

        const fileUpdated = fileUpdatedResult[0]
        const existFile = fs.existsSync(filePath)
        // console.log(`existFile : ${JSON.stringify(existFile, null, 2)}`)

        assert.isFalse(fileUpdated.isArchived)
        assert.isTrue(existFile)
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
  })
})
