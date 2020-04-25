const mongoose = require('mongoose')

const File = new mongoose.Schema({
  schemaVersion: { type: Number, required: true },
  createdTimestamp: { type: String, required: true }, // Time file was uploaded.
  size: { type: Number, required: true }, // size of the file in bytes
  payloadLink: { type: String }, // IPFS hash of current file.
  txId: { type: String }, // Memo transaction Id
  meta: { type: Object }
})

module.exports = mongoose.model('file', File)
