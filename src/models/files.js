const mongoose = require('mongoose')

const File = new mongoose.Schema({
  schemaVersion: { type: Number, required: true },
  createdTimestamp: { type: String, required: true }, // Time file was uploaded.
  size: { type: Number, required: true }, // size of the file in bytes
  lastAccessed: { type: String }, // Last time the file was accessed.
  userIdUpload: { type: String }, // User that uploaded the file.
  payloadLink: { type: String }, // IPFS hash of current file.
  updateIndex: { type: Number }, // Incremented every time the metadata is updated.
  txId: { type: String }, // Memo transaction Id
  meta: { type: Object }
})

module.exports = mongoose.model('file', File)