
const TexTile = require('@textile/hub')



let _this
class TEXTILEIO {
  constructor () {
    this.Buckets = TexTile.Buckets
    this.Client = TexTile.Client
    this.PrivateKey =  TexTile.PrivateKey
    this.createUserAuth = TexTile.createUserAuth


    // env data
    this.bucketName = 'testBucket'
    this.userKey = process.env.USERKEY
    this.userGroupKey = process.env.GROUPKEY 
    this.userGroupKeySecret = process.env.SECRETKEY 
    _this= this
}

  identity (string) {
    if (string) return _this.PrivateKey.fromString(string)
    // Create a new one if this is the first time
    const id = _this.PrivateKey.fromRandom()
    // Write it to the file for use next time
    console.log("priv key", id)
    return id
  }

  async initBucket(){
    try {
        const id = _this.identity(_this.userKey)
    
        // Create user auth object with auth signature valid for 30 minutes.
        const user = await _this.createUserAuth(_this.userGroupKey, _this.userGroupKeySecret)
        // console.log("user",user)
        const client = _this.Client.withUserAuth(user)
        // console.log("client",client)
    
        // Now that we have the pertinent metadata, authenticate user with hub.
        const token = await client.getToken(id)
        // console.log("client token ",token)
    
    
        // Create a bucket
        const key = _this.userGroupKey
        const buckets = await _this.Buckets.withKeyInfo({ key },{ debug: false })
        // console.log("buckets",buckets)
    
        // Authorize the user and your insecure keys with getToken
        const buckToken = await buckets.getToken(id)
        // console.log("buckToken",buckToken)
    
        const buck = await buckets.getOrCreate('testBucket')
        // console.log("buck",buck)

        return { buckets , bucketKey : buck.root.key }
    } catch (error) {
      console.log('Error in lib/textile.initBucket()',error)
      return false
    }
  }

  async pushPath(buckets, bucketKey, buffer, path){
    const result = await buckets.pushPath(bucketKey, path, buffer) 

    /**
     * Result example
     * 
     * result {
     *   path: {
     *     path: '/ipfs/bafkreibvd5v4qs2vzxc3woltsolutesei7ejmcvu4f24gz223a6pmu5rfm',
     *     cid: CID(bafkreibvd5v4qs2vzxc3woltsolutesei7ejmcvu4f24gz223a6pmu5rfm),
     *     root: CID(bafkreibvd5v4qs2vzxc3woltsolutesei7ejmcvu4f24gz223a6pmu5rfm),
     *     remainder: ''
     *   },
     *   root: '/ipfs/bafybeia7w2ripkevzbrs422kq3ypsgujaivz7p42cn6rplafcocuszfyqi'
     * }
     */
    return result
  }

}

module.exports = TEXTILEIO
