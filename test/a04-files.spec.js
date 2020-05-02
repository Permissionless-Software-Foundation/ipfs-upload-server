const testUtils = require('./utils')
const axios = require('axios').default
const assert = require('chai').assert
const config = require('../config')
const sinon = require('sinon')

// Mocking data libraries.
const mockData = require('./mocks/files-mocks')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const CONTROLLER = require('../src/modules/files/controller')
const controller = new CONTROLLER()

const LOCALHOST = `http://localhost:${config.port}`

const context = {}

describe('#Files', async function () {
  let sandbox

  before(async () => {
    // Create a second test user.
    const userObj = {
      email: 'testMetadata@metadata.com',
      username: 'testMetadata',
      password: 'pass2'
    }
    const testUser = await testUtils.createUser(userObj)
    context.testUser = testUser

    // Get the admin JWT token.
    const adminJWT = await testUtils.getAdminJWT()
    // console.log(`adminJWT: ${adminJWT}`)
    context.adminJWT = adminJWT
  })

  // Restore the sandbox before each test.
  beforeEach(() => (sandbox = sinon.createSandbox()))

  afterEach(() => sandbox.restore())

  describe('POST - Create Files', () => {
    /*         it('should reject File creation if no JWT provided', async () => {
                    try {
                        const options = {
                            method: 'POST',
                            url: `${LOCALHOST}/files`,
                            data: {
                                file: {
                                    schemaVersion: 1,
                                    size: 1,
                                }
                            }
                        }
                        await axios(options)
                        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
                        assert(false, 'Unexpected result')
                    } catch (err) {
                        assert(err.response.status === 401, 'Error code 401 expected.')
                    }
                })
         */
    it('should reject empty File', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {},
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'schemaVersion' must be a number"
        )
      }
    })

    it('should reject  if schemaVersion property is not include', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {
            file: {
              size: 1,
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'schemaVersion' must be a number!"
        )
      }
    })

    it('should reject if schemaVersion property is not number', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {
            file: {
              schemaVersion: 'test',
              size: 1,
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'schemaVersion' must be a number!"
        )
      }
    })
    it('should reject  if size property is not include', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {
            file: {
              schemaVersion: 1,
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(err.response.data, "Property 'size' must be a number")
      }
    })

    it('should reject if size property is not number', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {
            file: {
              schemaVersion: 1,
              size: 'test',
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(err.response.data, "Property 'size' must be a number!")
      }
    })

    it('should reject if createdTimestamp property is included', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/files`,
          data: {
            file: {
              schemaVersion: 1,
              size: 1,
              userIdUpload: 1,
              payloadLink: 'link',
              meta: { functionality: 'test' },
              createdTimestamp: 123
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'createdTimestamp' not allowed!"
        )
      }
    })

    it('should create file for admin user with minimum inputs', async function () {
      const options = {
        method: 'POST',
        url: `${LOCALHOST}/files`,
        data: {
          file: {
            schemaVersion: 1,
            size: 1
          }
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminJWT}`
        }
      }

      const result = await axios(options)
      // console.log(`result.body: ${JSON.stringify(result.body, null, 2)}`)

      assert.equal(result.data.success, true, 'success expected')

      assert.equal(result.data.file.schemaVersion, 1)
      assert.equal(result.data.file.size, 1)

      assert.property(result.data.file, '_id')
      assert.property(result.data.file, 'schemaVersion')
      assert.property(result.data.file, 'createdTimestamp')
      assert.property(result.data.file, 'size')
      assert.property(result.data.file, 'hostingCost')
      assert.property(result.data.file, 'bchAddr')
      assert.property(result.data.file, 'hasBeenPaid')
      assert.property(result.data.file, 'walletIndex')

      assert.isNumber(result.data.hostingCostUSD)
      assert.isNumber(result.data.hostingCostBCH)


    })

    it('should create file with all inputs', async function () {
      const options = {
        method: 'POST',
        url: `${LOCALHOST}/files`,
        data: {
          file: {
            schemaVersion: 1,
            size: 1,
            payloadLink: 'link',
            meta: { functionality: 'test' }
          }
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminJWT}`
        }
      }

      const result = await axios(options)
      // console.log(`result.body: ${JSON.stringify(result.body, null, 2)}`)

      assert.equal(result.data.success, true, 'success expected')
      assert.equal(result.data.file.schemaVersion, 1)
      assert.equal(result.data.file.payloadLink, 'link')
      assert.equal(result.data.file.meta.functionality, 'test')

      assert.property(result.data.file, '_id')
      assert.property(result.data.file, 'schemaVersion')
      assert.property(result.data.file, 'createdTimestamp')
      assert.property(result.data.file, 'size')
      assert.property(result.data.file, 'hostingCost')
      assert.property(result.data.file, 'bchAddr')
      assert.property(result.data.file, 'hasBeenPaid')
      assert.property(result.data.file, 'walletIndex')

      assert.isNumber(result.data.hostingCostUSD)
      assert.isNumber(result.data.hostingCostBCH)
    })
  })

  describe('GET /files', () => {
    /*         it('should not fetch file if the authorization header is missing', async () => {
                    try {
                        const options = {
                            method: 'GET',
                            url: `${LOCALHOST}/files`,
                            headers: {
                                Accept: 'application/json'
                            }
                        }
                        await axios(options)
                        assert.equal(true, false, 'Unexpected behavior')
                    } catch (err) {
                        assert.equal(err.response.status, 401)
                    }
                })
                it('should not fetch files if the authorization header is missing the scheme', async () => {
                    try {
                        const options = {
                            method: 'GET',
                            url: `${LOCALHOST}/files`,
                            headers: {
                                Accept: 'application/json',
                                Authorization: '1'
                            }
                        }
                        await axios(options)
                        assert.equal(true, false, 'Unexpected behavior')
                    } catch (err) {
                        assert.equal(err.response.status, 401)
                    }
                })
        it('should not fetch file if the authorization header has invalid scheme', async () => {
            const { token } = context
            try {
                const options = {
                    method: 'GET',
                    url: `${LOCALHOST}/files`,
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Unknown ${token}`
                    }
                }
                await axios(options)
                assert.equal(true, false, 'Unexpected behavior')
            } catch (err) {
                assert.equal(err.response.status, 401)
            }
        })
        it('should not fetch file if token is invalid', async () => {
            try {
                const options = {
                    method: 'GET',
                    url: `${LOCALHOST}/files`,
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer 1'
                    }
                }
                await axios(options)
                assert.equal(true, false, 'Unexpected behavior')
            } catch (err) {
                assert.equal(err.response.status, 401)
            }
        }) */

    it('should fetch all file', async () => {
      const token = context.testUser.token

      const options = {
        method: 'GET',
        url: `${LOCALHOST}/files`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      const result = await axios(options)
      const files = result.data.files
      // console.log(`files: ${JSON.stringify(files, null, 2)}`)

      // Save this value for later tests.
      context.fileId = files[1]._id

      assert.isArray(files)
      assert.property(files[0], '_id')
      assert.property(files[0], 'schemaVersion')
      assert.property(files[0], 'createdTimestamp')
      assert.property(files[0], 'size')
      assert.property(files[0], 'hostingCost')
      assert.property(files[0], 'bchAddr')
      assert.property(files[0], 'hasBeenPaid')
      assert.property(files[0], 'walletIndex')
      assert.property(files[0], 'schemaVersion')
      assert.property(files[0], 'createdTimestamp')
    })
  })

  describe('GET /files/:id', () => {
    /*         it('should not fetch files if token is invalid', async () => {
                    try {
                        const options = {
                            method: 'GET',
                            url: `${LOCALHOST}/files/1`,
                            headers: {
                                Accept: 'application/json',
                                Authorization: 'Bearer 1'
                            }
                        }
                        await axios(options)
                        assert.equal(true, false, 'Unexpected behavior')
                    } catch (err) {
                        assert.equal(err.response.status, 401)
                    }
                }) */

    it("should throw 404 if files doesn't exist", async () => {
      const token = context.testUser.token

      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        assert.equal(err.response.status, 404)
      }
    })

    it('should fetch files', async () => {
      const token = context.testUser.token
      const id = context.fileId

      const options = {
        method: 'GET',
        url: `${LOCALHOST}/files/${id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      const result = await axios(options)
      // console.log(`result.data:  ${JSON.stringify(result.data, null, 2)}`)

      const file = result.data.file

      assert.equal(file._id, id)

      assert.property(file, '_id')
      assert.property(file, 'schemaVersion')
      assert.property(file, 'createdTimestamp')
      assert.property(file, 'size')
      assert.property(file, 'hostingCost')
      assert.property(file, 'bchAddr')
      assert.property(file, 'hasBeenPaid')
      assert.property(file, 'walletIndex')
      assert.property(file, 'schemaVersion')
      assert.property(file, 'createdTimestamp')
    })
  })

  describe('PUT /files/:id', () => {
    /*         it('should not update files if token is invalid', async () => {
                    try {
                        const options = {
                            method: 'PUT',
                            url: `${LOCALHOST}/files/1`,
                            headers: {
                                Accept: 'application/json',
                                Authorization: 'Bearer 1'
                            }
                        }
                        await axios(options)
                        assert.equal(true, false, 'Unexpected behavior')
                    } catch (err) {
                        assert.equal(err.response.status, 401)
                    }
                }) */

    it('should not update if updateIndex property is included', async () => {
      const id = context.fileId
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/files/${id}`,
          data: {
            file: {
              schemaVersion: 1,
              size: 1,
              userIdUpload: 1,
              payloadLink: 'link',
              meta: { functionality: 'test' },
              updateIndex: 1
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(err.response.data, "Property 'updateIndex' not allowed!")
      }
    })

    it('should not update if schemaVersion property is not number', async () => {
      const id = context.fileId
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/files/${id}`,
          data: {
            file: {
              schemaVersion: 'test',
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'schemaVersion' must be a number"
        )
      }
    })
    it('should not update if size property is not number', async () => {
      const id = context.fileId
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/files/${id}`,
          data: {
            file: {
              schemaVersion: 1,
              size: 'test',
              userIdUpload: 'id user',
              payloadLink: 'link',
              meta: { functionality: 'test' }
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(err.response.data, "Property 'size' must be a number")
      }
    })

    it('should not update if createdTimestamp property is included', async () => {
      const id = context.fileId
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/files/${id}`,
          data: {
            file: {
              schemaVersion: 1,
              size: 1,
              userIdUpload: 1,
              payloadLink: 'link',
              meta: { functionality: 'test' },
              createdTimestamp: 123
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'createdTimestamp' not allowed!"
        )
      }
    })

    it('should not update if lastAccessed property is include', async () => {
      const id = context.fileId
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/files/${id}`,
          data: {
            file: {
              schemaVersion: 1,
              size: 1,
              userIdUpload: 1,
              payloadLink: 'link',
              meta: { functionality: 'test' },
              lastAccessed: 123
            }
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${context.adminJWT}`
          }
        }

        await axios(options)
        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)

        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          "Property 'lastAccessed' not allowed!"
        )
      }
    })

    it('should update files', async () => {
      const token = context.testUser.token
      const id = context.fileId

      const options = {
        method: 'PUT',
        url: `${LOCALHOST}/files/${id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        data: {
          file: {
            schemaVersion: 20,
            size: 30,
            userIdUpload: 'id user2',
            payloadLink: 'link',
            meta: { functionality: 'test2' }
          }
        }
      }

      const result = await axios(options)
      const file = result.data.file
      // console.log(`metadata result: ${JSON.stringify(metadata, null, 2)}`)

      assert.property(file, '_id')
      assert.property(file, 'createdTimestamp')
      assert.property(file, 'schemaVersion')
      // assert.property(file, 'updateIndex')

      assert.equal(file._id, id)
      assert.equal(file.schemaVersion, 20)
      assert.equal(file.size, 30)
      // assert.equal(file.userIdUpload, 'id user2')
    })
  })

  describe('getHostingFee', () => {
    it('should throw error  if fileBytes parameter is no include', async () => {
      try {
        await controller.getHostingFee()
        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'fileBytes must be a number')
      }
    })

    it('should return hosting fee', async () => {
      try {
        const fileSize = 1024
        sandbox.stub(controller.bchjs, 'getPrice').resolves(mockData.price)

        const result = await controller.getHostingFee(fileSize)
        // console.log(`result : ${JSON.stringify(result)}`)
        assert.property(result, 'USD')
        assert.property(result, 'BCH')
        assert.property(result, 'SAT')
        assert.isNumber(result.USD)
        assert.isNumber(result.BCH)
        assert.isNumber(result.SAT)
      } catch (err) {
        console.log(err)
        assert(false, 'Unexpected result')
      }
    })
  })
})