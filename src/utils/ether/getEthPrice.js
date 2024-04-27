import axios from "axios";

const getEthPrice = async () => {
    try {
        const ethResponse = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', );
        console.log("=>(getEthPrice.js:6) ethResponse", ethResponse);
        return ethResponse.data.USD
    } catch (e) {
        console.log(e)
        return 0
    }
}

export default getEthPrice
