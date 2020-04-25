const file = require('./controller')

module.exports.baseUrl = '/uppy-files'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      file.addFile
    ]
  },
  {
    method: 'PATCH',
    route: '/:id',
    handlers: [
      file.addFile
    ]
  }
]