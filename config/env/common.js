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
  companyAddr: 'bchtest:qqkdz3t0qt76mwnu9d2uc4mmjq7lsc8drq6s74pr56'

}
