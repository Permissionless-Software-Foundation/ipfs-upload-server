/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 5001,
  logPass: 'test',
  network: 'testnet',
  feePerMb: 0.001,
  apiJwt: process.env.BCHJSTOKEN || '',
  companyAddr: 'bchtest:qrhth6acvw8rf37jcz4wwd9uu902enyfksjgk6e9yr'

}
