const { ethers } = require("ethers");
const { loadABI } = require("./general.util");
const { parseLog } = require("./parse-log.util");
const MAX_RETRIES = 5;
const mapABI = new Map();
//delay func
const wait = ms => new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
});

async function getTransactionReceipt(rpc, provider, txHash, retries = 1, interval = 5 * 1000) {
    try {
        if (!provider) {
            provider = new ethers.JsonRpcProvider(rpc, undefined, {
                batchMaxCount: 1
            });
            await provider._start();
        }
        const result = await provider.getTransactionReceipt(txHash);
        console.log('GetTransactionReceipt:', result);
        return result;

    } catch (error) {
        console.log(`Error at ${retries} Message:`, error.message);
        if (retries < MAX_RETRIES) {
            await provider.destroy();
            retries = retries + 1;
            console.log(`Retries:${retries}-Wait next call:`, retries * interval / 1000, ' seconds');
            //delay the next call
            await wait(retries * interval);
            //reset provider
            return await getTransactionReceipt(rpc, null, txHash, retries, interval);
        } else {
            // Maximum retries reached. Handle the error.
            console.error(`Error -Tx hash:${txHash} -: `, error);
            return null;
        }
    }
}

module.exports.detailTransaction = async (chainId, rpc, provider, contractAddr, txHash, eventName) => {
    let txDetail = null;
    txDetail = await getTransactionReceipt(rpc, provider, txHash);
    // transaction success
    if (txDetail && txDetail.status == 1) {
        const key = `${chainId}-${contractAddr}-${eventName}`;
        if (mapABI.has(key) == false) {
            const abiContent = await loadABI(chainId, contractAddr);
            let eventAbi = abiContent.find(
                ({ name, type }) => name == eventName && type === "event"
            );
            mapABI.set(key, eventAbi);
        }
        const eventAbi = mapABI.get(key);
        //console.log(eventAbi);
        const eventData = parseLog(txDetail.logs, [eventAbi]);
        if (eventData.length > 0) {
            // parse GWei to eth unit
            return convertBigint(eventData[0].args, eventAbi);
        } else {
            console.warn("Not match event with abi");
            return null;
        }
    }
}
module.exports.getTransactionLog = async (chainId, provider, contractAddr, txHash, eventName) => {
    let txDetail = null;
    try {
        txDetail = await provider.getTransactionReceipt(txHash);
    } catch (error) {
        console.error('getTransactionReceipt:', error.message);
        throw error;
    }
    // transaction success
    if (txDetail && txDetail.status == 1) {
        const key = `${chainId}-${contractAddr}-${eventName}`;
        if (mapABI.has(key) == false) {
            const abiContent = await loadABI(chainId, contractAddr);
            let eventAbi = abiContent.find(
                ({ name, type }) => name == eventName && type === "event"
            );
            mapABI.set(key, eventAbi);
        }
        const eventAbi = mapABI.get(key);
        //console.log(eventAbi);
        const eventData = parseLog(txDetail.logs, [eventAbi]);
        if (eventData.length > 0) {
            // parse GWei to eth unit
            return convertBigint(eventData[0].args, eventAbi);
        } else {
            console.warn("Not match event with abi");
            return null;
        }
    } else {
        console.warn("Cannot check tx on-chain:", txDetail);
        return null;
    }
}

module.exports.getLogs = async (chainId, provider, contractAddr, fromBlock, toBlock, eventName) => {
    const key = `${chainId}-${contractAddr}-${eventName}`;
    if (mapABI.has(key) == false) {
        const abiContent = await loadABI(chainId, contractAddr);
        let abiInterface = new ethers.Interface(abiContent);
        console.log("Event name:", abiInterface.getEventName(eventName));
        const eventSignature = abiInterface.getEvent(eventName).topicHash;
        mapABI.set(key, eventSignature);
    }
    const topicHash = mapABI.get(key);
    if (!topicHash) {
        console.error(`Not found ${eventName} from abi json`);
        return null;
    }
    console.log("event:", topicHash);
    try {
        let rawLogs = await provider.getLogs({
            address: contractAddr,
            topics: [topicHash],
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        console.log(rawLogs);
    } catch (error) {
        console.error(`Cannot fetch event name:${eventName} from on-chain:`, error);
        return null;
    }
}
function convertBigint(source, eventAbi) {
    const finalData = {};
    for (const [key, value] of Object.entries(source)) {
        const input = eventAbi.inputs.find(i => i.name == key);
        switch (input.internalType) {
            case "uint256":
                finalData[key] = parseFloat(ethers.formatUnits(value, 18)); //wei
                break;
            case "uint128":
                finalData[key] = parseFloat(ethers.formatUnits(value, 9)); //Gwei
                break;
            case "uint64":
                finalData[key] = parseFloat(ethers.formatUnits(value, 6)); //wei
                break;
            default:
                finalData[key] = value
                break;
        }
    }
    console.log("log result:", finalData);
    return finalData;
}