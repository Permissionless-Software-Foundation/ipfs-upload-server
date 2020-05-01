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
const bchjsMockData = {
    rates1,
    rates2
}

module.exports = bchjsMockData