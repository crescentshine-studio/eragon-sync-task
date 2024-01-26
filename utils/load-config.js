
var fs = require('fs');
var path = require('path');

module.exports.getRPC = (chainId) => {
    switch (chainId) {
        case 1: return process.env.ETH_RPC || 'https://data-seed-prebsc-1-s3.binance.org:8545'
        case 56: return process.env.BSC_RPC || 'https://bsc-dataseed.binance.org'
        case 97: return process.env.BSC_RPC_TESTNET || 'https://data-seed-prebsc-1-s3.binance.org:8545'
        case 43113: return process.env.AVAX_RPC_TESTNET || 'https://avalanche-fuji-c-chain.publicnode.com'
        case 43114: return process.env.AVAX_RPC_MAINET || 'https://avalanche.public-rpc.com'
    }
}
module.exports.getContractAbi = async (contractAddr) => {
    const dirPath = path.join(__dirname, '..', 'abi');

    const jsonPath = path.join(dirPath, `${contractAddr}.json`);
    try {
        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }));
        }
    } catch (err) {
        fs.unlinkSync(jsonPath);
        throw new Error('Invalid local ABI');
    }
}
module.exports.loadConfig = (configFileName) => {
    const dirPath = path.join(__dirname, '..', 'config');
    const jsonPath = path.join(dirPath, `${configFileName}.json`);
    try {
        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }));
        } else {
            throw Error('Cannot found file config.');
        }
    } catch (err) {
        fs.unlinkSync(jsonPath);
        throw err;
    }

}