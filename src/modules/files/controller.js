const TUS = require('../../lib/tus-node-server')
const EVENTS = require('tus-node-server').EVENTS
const fs = require('fs')
const tus = new TUS()

// Handles the file upload.
async function addFile (ctx) {
  const tusServer = await tus.server()
  if (!tusServer) ctx.throw(500)

  // Event triggers after file upload is complete.
  tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
    console.log('Upload Completed!')
    //   console.log(event)
    const fileName = event.file.id

    const metad = await tus.parseMetadataString(event.file.upload_metadata)
    console.log(metad.fileNameToEncrypt.decoded)

    fs.renameSync(`files/${fileName}`, `files/${metad.fileNameToEncrypt.decoded}`)
  })

  return tusServer.handle(ctx.req, ctx.res)
}

module.exports = {
  addFile
}