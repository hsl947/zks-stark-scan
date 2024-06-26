import axios from 'axios';
import {getEthPrice} from "@utils";
import {dbConfig, initDB, update} from "@utils/indexedDB/main.js";


const getAllTransfers = async (address) => {
    let url = `https://block-explorer-api.mainnet.zksync.io/address/${address}/transfers?limit=100&page=1`;
    const transfers = [];

    while (true) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                const data = response.data.items;
                transfers.push(...data);
                if (response.data.links.next === '') break;
                url = 'https://block-explorer-api.mainnet.zksync.io/' + response.data.links.next;
            } else {
                console.error('Error occurred while retrieving transactions.');
                break;
            }
        } catch (error) {
            console.error('Error occurred while making the request:', error);
            break;
        }
    }

    return transfers;
};

const assignTransferValues = async (transactions) => {
    const ethResponse = await axios.post('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
    const tokensPrice = {
        USDC: 1,
        USDT: 1,
        ZKUSD: 1,
        CEBUSD: 1,
        LUSD: 1,
        ETH: parseInt(ethResponse.data.USD),
    };

    transactions.forEach((transaction) => {
        transaction.transfers.forEach((transfer) => {
            transfer.token.price = tokensPrice[transfer.token.symbol.toUpperCase()];
        });
        transaction.transfers = transaction.transfers.filter((transfer) => transfer.token.price !== undefined);
    });
};

export const getTransactionsList = async (address) => {
    let url = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=1`;
    const transactions = [];
    const ethResponse = await getEthPrice();
    while (true) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                const data = response.data.items;
                data.forEach((transaction) => {
                    const {hash, to, from, data, isL1Originated, fee, receivedAt, value} = transaction;
                    transactions.push({
                        hash: hash,
                        to: to,
                        from: from,
                        data: data,
                        isL1Originated: isL1Originated,
                        fee: fee,
                        receivedAt: receivedAt,
                        transfers: [],
                        ethValue: parseInt(ethResponse),
                        value: value,
                    });
                });

                if (response.data.links.next === '') break;
                url = 'https://block-explorer-api.mainnet.zksync.io/' + response.data.links.next;
            } else {
                console.error('Error occurred while retrieving transactions.');
                break;
            }
        } catch (error) {
            console.error('Error occurred while making the request:', error);
            break;
        }
    }

    const transfers = await getAllTransfers(address);

    transfers.forEach((transfer) => {
        if (transfer.token === null) return;
        transactions.forEach((transaction) => {
            if (transaction.hash === transfer.transactionHash) {
                transaction.transfers.push(transfer);
            }
        });
    });

    await assignTransferValues(transactions);

    await initDB(dbConfig)
    await update("zkTransactions", {
        address: address,
        data: JSON.stringify(transactions)
    })

    return transactions;
};

