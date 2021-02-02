// This file is related to this trello task --> https://trello.com/c/RuDRG9R1
const Textile = require('@textile/hub')

let _this
class TEXTILEIO {
  constructor() {
    this.Textile = Textile

    // env data
    this.bucketName = process.env.BUCKETNAME || 'testBucket'
    this.userKey = process.env.USERKEY
    this.userGroupKey = process.env.GROUPKEY
    this.userGroupKeySecret = process.env.SECRETKEY
    _this = this
  }


  // Authenticate user with hub.
  async authUser() {
    try {
      const id = _this.Textile.PrivateKey.fromString(_this.userKey)

      // Create user auth object with auth signature valid for 30 minutes.
      const user = await _this.Textile.createUserAuth(_this.userGroupKey, _this.userGroupKeySecret)

      const client = await _this.Textile.Client.withUserAuth(user)

      // Now that we have the pertinent metadata, authenticate user with hub.
      const token = await client.getToken(id)

      return {
        id,
        token
      }
    } catch (error) {
      console.log('Error in lib/textile.authUser()')
      throw error
    }
  }

  // Create or get an existing bucket
  async initBucket(id) {
    try {
      if(!id){
        throw new Error("Textile auth 'id' is required")
      }
      if (!_this.userGroupKey) {
        throw new Error("Textile 'GROUPKEY' is required")
      }
      if (!_this.userGroupKeySecret) {
        throw new Error("Textile 'SECRETKEY' is required")
      }

      // Create a bucket
      const key = _this.userGroupKey
      const buckets = await _this.Textile.Buckets.withKeyInfo({ key }, { debug: false })

      // Authorize the user and your insecure keys with getToken
      await buckets.getToken(id)
      // console.log("buckToken",buckToken)

      const buck = await buckets.getOrCreate(_this.bucketName)

      return { buckets, bucketKey: buck.root.key }
    } catch (error) {
      console.log('Error in lib/textile.initBucket()')
      throw error
    }
  }
  // Upload a file to the selected bucket
  async pushPath(buckets, bucketKey, buffer, path) {
    try {
      if(!buckets){
        throw new Error("buckets object is required")
      }
      if(!bucketKey){
        throw new Error("bucketKey is required")
      }
      if(!buffer){
        throw new Error("file buffer is required")
      }
      if(!path){
        throw new Error("file path is required")
      }
      const result = await buckets.pushPath(bucketKey, path, buffer)
  
      return result
    } catch (error) {
      console.log('Error in lib/textile.pushPath()')
      throw error
    }
  }

}

module.exports = TEXTILEIO
