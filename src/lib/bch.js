
const axios = require('axios').default

let _this
class BCH {
    constructor() {
        _this = this
        this.axios = axios
    }

    async getPrice() {
        try {
            const coinURL = 'https://api.coinbase.com/v2/exchange-rates?currency=BCH'
            const options = {
                method: 'GET',
                url: coinURL,
                headers: {
                    Accept: 'application/json',
                }
            }

            const result = await _this.axios.request(options)
            if (result.status !== 200)
                throw new Error("Error getting rates price")


            const USDperBCH = result.data.data.rates.USD

            return USDperBCH
        } catch (error) {
            throw error
        }



    }
}

module.exports = BCH