// const validator = require('../../middleware/validators')

// Instantiated Metadata controller
const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

module.exports.baseUrl = '/files'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      // Only logged-in users can create a new payloads
      // validator.ensureUser,
      controller.createFile
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // Only logged-in users can view payloads.
      // validator.ensureUser,
      controller.getFiles
    ]
  },
  {
    method: 'GET',
    route: '/check/:id',
    handlers: [
      // Only logged-in users can get payload details..
      // validator.ensureUser,
      controller.getFile,
      controller.checkPaidFile
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      // Only logged-in users can get payload details..
      // validator.ensureUser,
      controller.getFile
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      // Only logged-in users can update payloads.
      // validator.ensureUser,
      controller.getFile,
      controller.updateFile
    ]
  }
]
