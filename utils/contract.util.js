const { getABI } = require('./contract.util');
const { axiosGet } = require('./request.util');
//const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require('web3');

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://data-seed-prebsc-1-s3.binance.org:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_ENDPOINT));


const contractAddrUrl = `https://images.heroesland.io/contracts/${process.env.ENV}_contract_address.json`;



module.exports.loadEvent = (contractName) => {
    const jsonPath = path.join(dirPath, `${contractName}.json`);
    let contract;
    let arrKeccakEvent = [];
    try {
        contract = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf8" }));
    } catch (err) {
        fs.unlinkSync(jsonPath);
        throw new Error("Invalid local ABI");
    }
    let events = contract.abi.filter(
        (item) => item.type == "event" && excludeEvent.indexOf(item.name) < 0
    );
    //console.log(events);
    for (const event of events) {
        //console.log(event);
        let keccak256 = web3.eth.abi.encodeEventSignature(event);
        arrKeccakEvent.push({
            name: event.name,
            event: keccak256,
        });
    }
    return arrKeccakEvent;
};

//let web3 = null;
//let accounts = null;
//let localKeyProvider = null;

let deploymentContracts = null;
let instanceGameContract = null;
let instanceHeroNftContract = null;
let instanceBox1155Contract = null;

const accountSigner = '0x5bbc7eEBB8A2f54B600459bca2e57415c1FBBE8a';
const bnbAmount = '0.01';

module.exports.initalProvider = async (privateKey, heroBoxTokenId) => {

    const provider = new HDWalletProvider(privateKey, 'https://data-seed-prebsc-1-s1.binance.org:8545');
    const instanceWeb3 = new Web3(provider);
    const networkId = await instanceWeb3.eth.net.getId();
    console.log("Network id:", networkId);

    const accounts = instanceWeb3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(accounts);
    const contract = await loadInstanceBox1155Contract(instanceWeb3);
    //console.log("Default acc:", contract.defaultAccount);
    console.log(contract.methods.balanceOf);
    let balance = await contract.methods.balanceOf(accountSigner, web3.utils.toBN('9000000002')).call();
    console.log(`After-Signer:${accountSigner}-Balance of box ${heroBoxTokenId}:`, balance);
    const balanceFrom = web3.utils.fromWei(await instanceWeb3.eth.getBalance(accountSigner), 'ether');
    console.log(`The balance of ${accountSigner} is: ${balanceFrom} BNB`);
}
async function loadDeploymentContract() {
    if (!deploymentContracts) {
        try {
            deploymentContracts = await axiosGet(contractAddrUrl);
        } catch (error) {
            console.error("Error when load contract from api:", error);
        }

    }

}
async function loadInstanceContractGame() {
    await loadDeploymentContract();
    const contractGame = 'Game';
    const contractGameAddr = deploymentContracts[`${contractGame}Addr`];
    const gameContractFile = `${contractGame}Contract`;
    const abi = getABI(gameContractFile).abi;
    if (!instanceGameContract) {
        instanceGameContract = await new web3.eth.Contract(abi, contractGameAddr);
    }
}
async function loadInstanceHeroNftContract() {
    await loadDeploymentContract();
    const name = 'HeroNft';
    const contractAddr = deploymentContracts[`${name}Addr`];
    const contractFile = `${name}`;
    const abi = getABI(contractFile).abi;
    if (!instanceHeroNftContract) {
        console.log("Intial instance contract:", contractAddr);
        instanceHeroNftContract = new web3.eth.Contract(abi, contractAddr);
    }
}
async function loadInstanceBox1155Contract() {
    await loadDeploymentContract();
    const name = 'BoxNft1155';
    const contractAddr = deploymentContracts[`${name}Addr`];
    const contractFile = `${name}`;
    const abi = getABI(contractFile).abi;
    //console.log(abi);
    if (!instanceBox1155Contract) {
        console.log("Intial instance contract:", contractAddr);
        instanceBox1155Contract = await new web3.eth.Contract(abi, contractAddr);
    }
    //return new instanceWeb3.eth.Contract(abi, contractAddr);
}
async function getNonceFromGameContract(address) {
    await loadInstanceContractGame();
    try {
        console.log(`Get none from contract game`);
        let nonce = await instanceGameContract.methods.getNonce(addr).call();
        // let nonce = await verifyContract.methods.getNonce();
        console.log(`Game--Addr:${address}-None value:`, nonce);
        return nonce;
    } catch (error) {
        console.error(`Get Nonce from game contract error:`, error);
        return null;
    }
}