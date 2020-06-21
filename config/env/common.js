/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 5001,
  logPass: 'test',
  network: process.env.NETWORK ? process.env.NETWORK : 'testnet',
  // network: 'mainnet',
  feePerMb: 0.001,
  apiJwt: process.env.BCHJSTOKEN || '',
  // companyAddr: 'bchtest:qrhth6acvw8rf37jcz4wwd9uu902enyfksjgk6e9yr',
  companyAddr: 'bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr',
  temporalLogin: process.env.TEMPORAL_LOGIN ? process.env.TEMPORAL_LOGIN : '',
  temporalPass: process.env.TEMPORAL_PASS ? process.env.TEMPORAL_PASS : ''
}
