const TUS = require('../../lib/tus-node-server')
const EVENTS = require('tus-node-server').EVENTS
const File = require('../../models/files')
const fs = require('fs')
const tus = new TUS()

// Handles the file upload.
async function addFile (ctx) {
  const tusServer = await tus.server()
  if (!tusServer) ctx.throw(500)

  // Event triggers after file upload is complete.
  tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async event => {
    console.log('Upload Completed!')

    try {
      console.log(`File data: ${JSON.stringify(event.file, null, 2)}`)

      // Get metadata from file uploaded
      const metad = await tus.parseMetadataString(event.file.upload_metadata)
      console.log(`File metadata : ${JSON.stringify(metad, null, 2)}`)

      const fileName = event.file.id
      const originalFileName = metad.filename ? metad.filename.decoded : ''

      const fileModelId = metad.fileModelId ? metad.fileModelId.decoded : ''

      // Verify that this file contains a model
      // created in the database
      const file = fileModelId ? await File.findById(fileModelId) : null
      console.log(`File Model found: ${JSON.stringify(file, null, 2)}`)

      // Delete file if model doesn't exist
      if (!file) {
        // Delete file
        await tus.deleteFile(fileName)
      }

      // Verify the actual upload size is less than 110% of the size reported
      // when the model was reported. This prevents people from gaming the
      // system by reporting a small file, then uploading a large file.
      if (event.file.upload_length > file.size * 1.1) {
        await tus.deleteFile(fileName)
      }

      // Rename file so it matches the users original file name.
      if (originalFileName) {
        fs.renameSync(
          `uppy-files/${fileName}`,
          `uppy-files/${originalFileName}`
        )
      }
    } catch (error) {
      console.log(error)
    }
  })

  return tusServer.handle(ctx.req, ctx.res)
}

module.exports = {
  addFile
}
