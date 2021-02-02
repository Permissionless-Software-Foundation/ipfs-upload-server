// const axios = require('axios').default
const assert = require('chai').assert
const sinon = require('sinon')

// Mocking data libraries.
const mockFile = require('./mocks/textile-mocks')
let mockData

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const TEXTILEIO = require('../src/lib/textileio')
let uut // Unit Under Test.

describe('#TEXTILEIO', async function () {
  let sandbox

  before(async () => {
  })

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    // Restore the mocked data before each test.
    mockData = Object.assign({}, mockFile)

    uut = new TEXTILEIO()
    uut.userKey = mockData.USERKEY
    uut.userGroupKey = mockData.GROUPKEY
    uut.userGroupKeySecret = mockData.SECRETKEY
  })

  afterEach(() => sandbox.restore())

  describe('authUser', () => {
    it('should auth user with hub', async () => {
      try {
        sandbox
          .stub(uut.Textile, 'createUserAuth')
          .resolves(mockData.user)

        sandbox
          .stub(uut.Textile.Client, 'withUserAuth')
          .resolves(mockData.client)

        const result = await uut.authUser()
        // console.log(`result : ${JSON.stringify(result)}`)
        assert.property(result, 'id')
        assert.property(result, 'token')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
    it('should handle error', async () => {
      try {
        sandbox
          .stub(uut.Textile.Client, 'withUserAuth')
          .throws(new Error('test error'))

        await uut.authUser()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('initBucket', () => {
    it('should init bucket', async () => {
      try {
        sandbox
          .stub(uut.Textile.Buckets, 'withKeyInfo')
          .resolves(mockData.buckets)

        const result = await uut.initBucket('id')
        // console.log(`result : ${JSON.stringify(result)}`)
        assert.property(result, 'buckets')
        assert.property(result, 'bucketKey')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
    it('should throw error if id property is not provided', async () => {
      try {
        await uut.initBucket()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, "Textile auth 'id' is required")
      }
    })
    it('should throw error if userGroupKey variable is not defined', async () => {
      try {
        uut.userGroupKey = null
        await uut.initBucket('id')
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, "Textile 'GROUPKEY' is required")
      }
    })
    it('should throw error if userGroupKeySecret variable is not defined', async () => {
      try {
        uut.userGroupKeySecret = null
        await uut.initBucket('id')
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, "Textile 'SECRETKEY' is required")
      }
    })
  })

  describe('pushPath', () => {
    it('should push to ipfs', async () => {
      try {
        sandbox
          .stub(uut.Textile.Buckets, 'withKeyInfo')
          .resolves(mockData.buckets)

        const buckets = await uut.initBucket('id')

        const result = await uut.pushPath(
          buckets.buckets,
          buckets.bucketKey,
          'buffer',
          'image.png'
        )
        const path = result.path

        assert.property(result, 'path')
        assert.property(result, 'root')

        assert.property(path, 'path')
        assert.property(path, 'cid')
        assert.property(path, 'root')
        assert.property(path, 'remainder')
      } catch (err) {
        assert(false, 'Unexpected result')
      }
    })
    it('should throw error if buckets object is not provided', async () => {
      try {
        await uut.pushPath()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'buckets object is required')
      }
    })
    it('should throw error if bucketKey  is not provided', async () => {
      try {
        sandbox
          .stub(uut.Textile.Buckets, 'withKeyInfo')
          .resolves(mockData.buckets)

        const buckets = await uut.initBucket('id')

        await uut.pushPath(
          buckets.buckets
        )

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'bucketKey is required')
      }
    })
    it('should throw error if buffer  is not provided', async () => {
      try {
        sandbox
          .stub(uut.Textile.Buckets, 'withKeyInfo')
          .resolves(mockData.buckets)

        const buckets = await uut.initBucket('id')

        await uut.pushPath(
          buckets.buckets,
          buckets.bucketKey
        )

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'file buffer is required')
      }
    })
    it('should throw error if file path  is not provided', async () => {
      try {
        sandbox
          .stub(uut.Textile.Buckets, 'withKeyInfo')
          .resolves(mockData.buckets)

        const buckets = await uut.initBucket('id')

        await uut.pushPath(
          buckets.buckets,
          buckets.bucketKey,
          'buffer'
        )

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'file path is required')
      }
    })
  })
})
