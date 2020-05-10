const mongoose = require('mongoose')

// Force test environment
// make sure environment variable is set before this file gets called.
// see test script in package.json.
// process.env.KOA_ENV = 'test'
const config = require('../../config')

const Files = require('../../src/models/files')

async function deleteFiles () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )

  // Get all the users in the DB.
  const files = await Files.find({})
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  // Delete each user.
  for (let i = 0; i < files.length; i++) {
    const thisUser = files[i]
    await thisUser.remove()
  }

  mongoose.connection.close()
}
deleteFiles()
