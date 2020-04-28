
const axios = require('axios').default
const assert = require('chai').assert

const sinon = require('sinon')

// Mocking data libraries.
const mockData = require('./mocks/bchjs-mocks')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const BCHJS = require('./../src/lib/bch')
const bchjs = new BCHJS()




describe('#Files', async function () {
    let sandbox

    before(async () => {

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
    })
    describe('getPrice', () => {
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
})
