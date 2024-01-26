const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const HASH_ALGORITHMS = 'sha512';
const { getContractAbi } = require("./request.util");

module.exports.delay = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.loadABI = async (chainId, contractAddr) => {
    const dirPath = path.join(__dirname, '..', 'abi');
    const jsonPath = path.join(dirPath, `${contractAddr}.json`);
    try {
        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }));
        }
        const content = await getContractAbi(chainId, contractAddr);
        fs.writeFileSync(jsonPath, JSON.stringify(content));
        return content;
    } catch (err) {
        //fs.unlinkSync(jsonPath);
        console.log(err);
        throw new Error('Invalid local ABI:', err);
    }
}

module.exports.generateKeyPair = () => {

    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return {
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString()
    }
}
const IV_LENGTH = 16; // For AES, this is always 16
module.exports.encrypt = (text, privateKey) => {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(privateKey), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

module.exports.decrypt = (text, privateKey) => {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(privateKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}