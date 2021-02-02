const rates1 = {
  status: 200,
  data: {
    data: {
      currency: 'BCH',
      rates: {
        HKD: '1853.96456575',
        HNL: '5945.427810465',
        USD: '239.195',
        USDC: '239.195',
        UYU: '10455.67700991',
        UZS: '2429016.85891568',
        VEF: '59437001.585835995'
      }
    }
  }
}

const rates2 = {
  status: 500,
  data: {
    data: {
      currency: 'BCH',
      rates: {
        HKD: '1853.96456575',
        HNL: '5945.427810465',
        USD: '239.195',
        USDC: '239.195',
        UYU: '10455.67700991',
        UZS: '2429016.85891568',
        VEF: '59437001.585835995'
      }
    }
  }
}

const PositiveElectrumxBalance = {
  success: true,
  balance: {
    confirmed: 1000,
    unconfirmed: 5000
  }
}

const NegativeElectrumxBalance = {
  success: true,
  balance: {
    confirmed: 0,
    unconfirmed: 0
  }
}

const utxos = [
  {
    tx_hash: '4f8f9ff19acf3a1502204b561905d88c039b49b95bcb960bd02a4e4f211d9aaa',
    tx_pos: 0,
    value: 5000,
    confirmations: 0,
    satoshis: 5000
  }
]

const hex =
  '0200000001d6e3814cd3ee158e8c8b21c002f2f556c9c66aaf0c3db1c6d28c0403c9fa91ef010000006a473044022073982750525122ff896b822995dfedb69f52155d238bf25378eb12c7f1c5365402200b6f9a511f84fa2c3f730cc4d46770a3ab112a9fd6e01ada6a7c5b1612f1db9a412102b307f155ea24f3bfb0b87078ac8c6c2d0c0badcc1680ee08a2fc975fe76acbc7ffffffff0288130000000000001976a9143376a9a26e3cefecbf7fcc4f060e9cccee8ca32e88ac74fd9500000000001976a9149150e15bd251f4d330047dc5cf509941d6970b7188ac00000000'

const txId = [
  'fdc7fdd4bb1c0076d3fd88f3368835c56330a672100f76e174fb11e00e03e5e6'
]

const mockFiles = [
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5ed9210d870dc4454876b0d5',
    schemaVersion: 1,
    size: 132238,
    fileId: 'uppy-pic1/png-1e-image/png-132238-1588951903688',
    fileName: 'pic1.png',
    fileExtension: 'png',
    createdTimestamp: '1591288077.786',
    hostingCost: 3872,
    walletIndex: 5,
    bchAddr: 'bchtest:qqwzf427n7g0xqpn8x6u5m8d85f4xxy2qcen4yt2z4',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5ed92163870dc4454876b0d6',
    schemaVersion: 1,
    size: 132238,
    fileId: 'uppy-pic1/png-1e-image/png-132238-1588951903688',
    fileName: 'pic1.png',
    fileExtension: 'png',
    createdTimestamp: '1591288163.653',
    hostingCost: 3872,
    walletIndex: 6,
    bchAddr: 'bchtest:qzm5sjcsgzgfxmkqrk4gz5mg78a35wk6qqufp7fgg8',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5ed921a3870dc4454876b0d8',
    schemaVersion: 1,
    size: 132238,
    fileId: 'uppy-pic1/png-1e-image/png-132238-1588951903688',
    fileName: 'pic1.png',
    fileExtension: 'png',
    createdTimestamp: '1591288227.437',
    hostingCost: 3872,
    walletIndex: 7,
    bchAddr: 'bchtest:qpqxaf9d78tqzn4uc4utme7zet7sgqkd6u8q7sg42p',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5ed921df870dc4454876b0d9',
    schemaVersion: 1,
    size: 132238,
    fileId: 'uppy-pic1/png-1e-image/png-132238-1588951903688',
    fileName: 'pic1.png',
    fileExtension: 'png',
    createdTimestamp: '1591288287.954',
    hostingCost: 3872,
    walletIndex: 8,
    bchAddr: 'bchtest:qz35tgyv8d0kq2jtxqhjh9hady27uvcg8y8rtwhxy8',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e070ee884981c3bcd34c4',
    schemaVersion: 1,
    size: 1198440,
    fileId:
      'uppy-screenshot/from/2020/10/06/13/42/45/png-10-10-1d-1d-10-1d-1d-1e-image/png-1198440-1602016990000',
    fileName: 'Screenshot from 2020-10-06 13-42-45.png',
    fileExtension: 'png',
    createdTimestamp: '1602094862.384',
    hostingCost: 4507,
    walletIndex: 9,
    bchAddr: 'bchtest:qq67wt5jk4m42g8xul9a00d4qwpx7rxf2yvuz0tl8r',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e077c6be82d1d929da84e',
    schemaVersion: 1,
    size: 142197,
    fileId:
      'uppy-screenshot/from/2020/10/05/07/37/37/png-10-10-1d-1d-10-1d-1d-1e-image/png-142197-1601908657000',
    fileName: 'Screenshot from 2020-10-05 07-37-37.png',
    fileExtension: 'png',
    createdTimestamp: '1602094972.312',
    hostingCost: 4507,
    walletIndex: 10,
    bchAddr: 'bchtest:qrwy640n9kzrw6s9z58havw9hhtev8hqa57v3waztw',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e091ae7098f1eef091658',
    schemaVersion: 1,
    size: 142197,
    fileId:
      'uppy-screenshot/from/2020/10/05/07/37/37/png-10-10-1d-1d-10-1d-1d-1e-image/png-142197-1601908657000',
    fileName: 'Screenshot from 2020-10-05 07-37-37.png',
    fileExtension: 'png',
    createdTimestamp: '1602095386.925',
    hostingCost: 4507,
    walletIndex: 11,
    bchAddr: 'bchtest:qqnup3k2ns7qts5kzpmjxlr7nundlm0y95y48waf3s',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e0c6b8db3ec226a4836e3',
    schemaVersion: 1,
    size: 142197,
    fileId:
      'uppy-screenshot/from/2020/10/05/07/37/37/png-10-10-1d-1d-10-1d-1d-1e-image/png-142197-1601908657000',
    fileName: 'Screenshot from 2020-10-05 07-37-37.png',
    fileExtension: 'png',
    createdTimestamp: '1602096235.368',
    hostingCost: 4504,
    walletIndex: 1,
    bchAddr: 'bchtest:qr70d76njhyd3tzs9qr5tf7s8m07ax45wcpm6t2xls',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e0da20a3980235cf7ac8d',
    schemaVersion: 1,
    size: 142197,
    fileId:
      'uppy-screenshot/from/2020/10/05/07/37/37/png-10-10-1d-1d-10-1d-1d-1e-image/png-142197-1601908657000',
    fileName: 'Screenshot from 2020-10-05 07-37-37.png',
    fileExtension: 'png',
    createdTimestamp: '1602096546.59',
    hostingCost: 4502,
    walletIndex: 2,
    bchAddr: 'bchtest:qp73h4nf5xk36pprpnrjt56zj8qcz0c8fq0x0fae8j',
    __v: 0
  },
  {
    payloadLink: '',
    hasBeenPaid: false,
    isArchived: false,
    _id: '5f7e0e192031e1240607c911',
    schemaVersion: 1,
    size: 142197,
    fileId:
      'uppy-screenshot/from/2020/10/05/07/37/37/png-10-10-1d-1d-10-1d-1d-1e-image/png-142197-1601908657000',
    fileName: 'Screenshot from 2020-10-05 07-37-37.png',
    fileExtension: 'png',
    createdTimestamp: '1602096665.7',
    hostingCost: 4502,
    walletIndex: 3,
    bchAddr: 'bchtest:qp23r0ceru5384458e69lgctuhy7x5e7xgunsy4qc5',
    __v: 0
  }
]

const mockFileBalances = {
  success: true,
  balances: [
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qqwzf427n7g0xqpn8x6u5m8d85f4xxy2qcen4yt2z4'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qzm5sjcsgzgfxmkqrk4gz5mg78a35wk6qqufp7fgg8'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qpqxaf9d78tqzn4uc4utme7zet7sgqkd6u8q7sg42p'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qz35tgyv8d0kq2jtxqhjh9hady27uvcg8y8rtwhxy8'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qq67wt5jk4m42g8xul9a00d4qwpx7rxf2yvuz0tl8r'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qrwy640n9kzrw6s9z58havw9hhtev8hqa57v3waztw'
    },
    {
      balance: {
        confirmed: 0,
        unconfirmed: 0
      },
      address: 'bchtest:qqnup3k2ns7qts5kzpmjxlr7nundlm0y95y48waf3s'
    },
    {
      balance: {
        confirmed: 4505,
        unconfirmed: 0
      },
      address: 'bchtest:qr70d76njhyd3tzs9qr5tf7s8m07ax45wcpm6t2xls'
    },
    {
      balance: {
        confirmed: 4503,
        unconfirmed: 0
      },
      address: 'bchtest:qp73h4nf5xk36pprpnrjt56zj8qcz0c8fq0x0fae8j'
    },
    {
      balance: {
        confirmed: 4503,
        unconfirmed: 0
      },
      address: 'bchtest:qp23r0ceru5384458e69lgctuhy7x5e7xgunsy4qc5'
    }
  ]
}

const bchjsMockData = {
  rates1,
  rates2,
  PositiveElectrumxBalance,
  NegativeElectrumxBalance,
  utxos,
  hex,
  txId,
  mockFiles,
  mockFileBalances
}

module.exports = bchjsMockData
