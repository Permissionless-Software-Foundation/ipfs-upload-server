/*
    This library handles file uploads using the TUS protocol. This is a newer
    protocol which allows file upload with resume.
*/

const tus = require('tus-node-server')
const tusServer = new tus.Server()
const fs = require('fs')

const File = require('../models/files')
const wlogger = require('./wlogger')

let _this
class TUS {
  constructor (path) {
    // Embed external libraries into the class, for easy mocking.
    this.tusServer = tusServer
    _this = this

    _this.fs = fs
    _this.File = File
    // By default make path an empty string.
    _this.filesPath = ''
    // If user specified a path to use, use that.
    path && path !== ''
      ? (_this.filesPath = path)
      : (_this.filesPath = 'uppy-files')
  }

  async server () {
    if (_this.filesPath && typeof _this.filesPath !== 'string') {
      throw new Error('Path must be  string')
    }
    try {
      _this.tusServer.datastore = new tus.FileStore({
        path: `/${_this.filesPath}`
      })

      return _this.tusServer
    } catch (error) {
      return false
    }
  }

  getServer () {
    return _this.tusServer
  }

  // parse metadata from file
  async parseMetadataString (metadataString) {
    const kvPairList = metadataString.split(',')

    return kvPairList.reduce((metadata, kvPair) => {
      const [key, base64Valuse] = kvPair.split(' ')

      metadata[key] = {
        encoded: base64Valuse,
        decoded: Buffer.from(base64Valuse, 'base64').toString('ascii')
      }

      return metadata
    }, {})
  }

  // Function to delete  file
  async deleteFile (fileName) {
    return new Promise((resolve, reject) => {
      try {
        // Input Validation
        if (!fileName || typeof fileName !== 'string') {
          throw new Error('fileName must be a string!')
        }
        const path = `${_this.filesPath}/${fileName}`
        if (!_this.fs.existsSync(path)) {
          throw reject(new Error('no such file or directory'))
        }

        _this.fs.unlink(path, err => {
          if (err) throw reject(new Error(false))
          resolve(true)
        })
      } catch (err) {
        return reject(err)
      }
    })
  }

  // Get difference between 2 Date Time
  // https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
  getDifferTime (date1, date2) {
    try {
      if (!date1 || typeof date1 !== 'object') {
        throw new Error('date1 must be a Date() instance')
      }
      if (!date2 || typeof date2 !== 'object') {
        throw new Error('date2 must be a Date() instance')
      }

      // https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
      const millisec = Math.abs(date1 - date2)
      const seconds = (millisec / 1000).toFixed(1)
      const minutes = (millisec / (1000 * 60)).toFixed(1)
      const hours = (millisec / (1000 * 60 * 60)).toFixed(1)
      const days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1)

      const difference = {
        millisec,
        seconds,
        minutes,
        hours,
        days
      }

      return difference
    } catch (err) {
      wlogger.info('Error in files/tus-node-server.js/getDifferTime() ')
      throw err
    }
  }

  async cleanUp () {
    try {
      let filesDeleted = 0 // Debug log

      const filesArray = await _this.File.find({ isArchived: false })
      if (!filesArray.length) {
        console.log('Not found files un archived to clear')
        return
      }

      const now = new Date()

      // Map files array
      for (const file of filesArray) {
        const fileTimestamp = file.createdTimestamp
        const fileDate = new Date(fileTimestamp * 1000)

        // Get differences beetwen file date and the current date
        const differ = _this.getDifferTime(now, fileDate)

        if (differ.hours >= 24) {
          const path = `${_this.filesPath}/${file.fileName}`

          // Delete file if it exist
          if (_this.fs.existsSync(path)) {
            await _this.deleteFile(file.fileName)
          }

          file.isArchived = true
          await file.save()

          // files deleted count
          filesDeleted++
        }
      }

      wlogger.info(`files  : ${filesArray.length} `)
      wlogger.info(`filesDeleted : ${filesDeleted} `)
    } catch (err) {
      wlogger.info('Error in files/tus-node-server.js/cleanUp() ')
      throw err
    }
  }
}

module.exports = TUS
