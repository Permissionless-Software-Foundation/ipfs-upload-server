const mongoose = require('mongoose')

const File = new mongoose.Schema({
  schemaVersion: { type: Number, required: true },
  createdTimestamp: { type: String, required: true }, // Time file was uploaded.
  size: { type: Number, required: true }, // size of the file in bytes
  payloadLink: { type: String, default: '' }, // IPFS hash of current file.
  txId: { type: String }, // Memo transaction Id
  meta: { type: Object },
  bchAddr: { type: String }, // BCH address assigned to this file.
  walletIndex: { type: Number }, // The HD wallet index used to generate this address.
  hasBeenPaid: { type: Boolean, default: false }, // Flag if hosting cost has been paid.
  pinExpires: { type: String }, // ISO date when IPFS pin for hosted content will expire.
  hostingCost: { type: Number }, // Value in satoshis of the hosting cost for this file.
  fileId: { type: String }, // FileID assigned to the file by Uppy.
  fileName: { type: String }, // Original filename of the file before being uploaded to Uppy.
  fileExtension: { type: String } // The extension as detected by Uppy.
})

module.exports = mongoose.model('file', File)
