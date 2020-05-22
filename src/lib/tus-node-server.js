/*
    This library handles file uploads using the TUS protocol. This is a newer
    protocol which allows file upload with resume.
*/

const tus = require('tus-node-server')
const tusServer = new tus.Server()
const fs = require('fs')
let _this
class TUS {
    constructor(path) {
        // Embed external libraries into the class, for easy mocking.
        this.tusServer = tusServer
        _this = this
        // By default make path an empty string.
        _this.filesPath = ''
        _this.fs = fs
        // If user specified a path to use, use that.
        path && path !== ''
            ? (_this.filesPath = path)
            : (_this.filesPath = 'uppy-files')
    }

    async server() {
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

    getServer() {
        return _this.tusServer
    }

    // parse metadata from file
    async parseMetadataString(metadataString) {
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
    async deleteFile(fileName) {
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
                console.log(err)
                return reject(err)
            }
        })
    }
}

module.exports = TUS
