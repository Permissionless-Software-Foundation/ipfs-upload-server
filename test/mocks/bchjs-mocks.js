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
                VEF: '59437001.585835995',
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
                VEF: '59437001.585835995',
            }
        }
    }
}
const PositiveElectrumxBalance = {
    success: true,
    balance: {
        confirmed: 1000,
        unconfirmed: 5000,
    }
}
const NegativeElectrumxBalance = {
    success: true,
    balance: {
        confirmed: 0,
        unconfirmed: 0,
    }
}

const utxos = [
    {
        "txid": "4f8f9ff19acf3a1502204b561905d88c039b49b95bcb960bd02a4e4f211d9aaa",
        "vout": 0,
        "value": "5000",
        "confirmations": 0,
        "satoshis": 5000
    }
]

const hex = '0200000001d6e3814cd3ee158e8c8b21c002f2f556c9c66aaf0c3db1c6d28c0403c9fa91ef010000006a473044022073982750525122ff896b822995dfedb69f52155d238bf25378eb12c7f1c5365402200b6f9a511f84fa2c3f730cc4d46770a3ab112a9fd6e01ada6a7c5b1612f1db9a412102b307f155ea24f3bfb0b87078ac8c6c2d0c0badcc1680ee08a2fc975fe76acbc7ffffffff0288130000000000001976a9143376a9a26e3cefecbf7fcc4f060e9cccee8ca32e88ac74fd9500000000001976a9149150e15bd251f4d330047dc5cf509941d6970b7188ac00000000'

const txId = [
    "fdc7fdd4bb1c0076d3fd88f3368835c56330a672100f76e174fb11e00e03e5e6"
]
const bchjsMockData = {
    rates1,
    rates2,
    PositiveElectrumxBalance,
    NegativeElectrumxBalance,
    utxos,
    hex,
    txId

}

module.exports = bchjsMockData