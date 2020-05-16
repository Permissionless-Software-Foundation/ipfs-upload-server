const TUS = require('../../lib/tus-node-server')
const EVENTS = require('tus-node-server').EVENTS
const fs = require('fs')
const tus = new TUS()

// Handles the file upload.
async function addFile (ctx) {
  const tusServer = await tus.server()
  if (!tusServer) ctx.throw(500)

  // Event triggers after file upload is complete.
  tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async event => {
    console.log('Upload Completed!')
    // console.log(event)

    // This is the name of the file uppy will create on the server.
    const fileId = event.file.id

    const metad = await tus.parseMetadataString(event.file.upload_metadata)
    // console.log(`metad: ${JSON.stringify(metad, null, 2)}`)

    // This is the original file name of the file the user uploaded.
    const fileName = metad.name.decoded

    // Rename the uppy-assigned filename to the original file name.
    fs.renameSync(`uppy-files/${fileId}`, `uppy-files/${fileName}`)
  })

  return tusServer.handle(ctx.req, ctx.res)
}

module.exports = {
  addFile
}
