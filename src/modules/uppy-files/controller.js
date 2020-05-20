const TUS = require('../../lib/tus-node-server')
const EVENTS = require('tus-node-server').EVENTS
const File = require('../../models/files')
const fs = require('fs')
const tus = new TUS()

// Handles the file upload.
async function addFile(ctx) {
  const tusServer = await tus.server()
  if (!tusServer) ctx.throw(500)

  // Event triggers after file upload is complete.
  tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async event => {
    console.log('Upload Completed!')

    try {
      // Get metadata from file uploaded
      const metad = await tus.parseMetadataString(event.file.upload_metadata)
      //console.log(`File metadata : ${JSON.stringify(metad, null, 2)}`)

      const fileName = event.file.id

      const fileModelId = metad.fileModelId ?
        metad.fileModelId.decoded : ''

      // Verify that this file contains a model 
      // created in the database
      const file = fileModelId ? await File.findById(fileModelId) : null
      //console.log(`File Model : ${JSON.stringify(file, null, 2)}`)

      // Delete file if model doesn't exist
      if (!file) {
        //Delete file 
        await tus.deleteFile(fileName)

      }

      // Rename file for better reference,
      // and to be able to use them in the future 
      //fs.renameSync(
      //  `uppy-files/${fileName}`,
      //  `uppy-files${metad.fileNameToEncrypt.decoded}`
      //)


    } catch (error) {
      console.log(error)
    }

  })

  return tusServer.handle(ctx.req, ctx.res)
}

module.exports = {
  addFile
}
