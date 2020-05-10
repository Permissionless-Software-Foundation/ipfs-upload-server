const mongoose = require('mongoose')

const config = require('../../config')

const Files = require('../../src/models/files')

async function getFiles () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const files = await Files.find({})
  console.log(`files: ${JSON.stringify(files, null, 2)}`)

  mongoose.connection.close()
}
getFiles()
