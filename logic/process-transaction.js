const { providers } = require("web3");
const { detailTransaction } = require('../utils/transaction.util');

const processingQueue = [];
let isProcessing = false;

async function addToProcessingQueue(provider, txHash) {
    processingQueue.push(txHash);
    await this.processTransaction(provider);
}

module.exports.processTransaction = async (provider) => {
    if (isProcessing) {
        return;
    }
    isProcessing = true;
    //pick first txHash then process
    const txHash = processingQueue.shift();

}