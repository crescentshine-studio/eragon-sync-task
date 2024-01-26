
const ethers = require("ethers");
const axios = require("axios");
const { processError } = require('./error.util');
const { getRPC } = require("./load-config");


const EAR3_ROOT_API = process.env.EAR3_ROOT_API;
const GAME_API_KEY = process.env.GAME_API_KEY;

module.exports.axiosGet = async (url) => {
  try {
    const resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    await processError(`Url:${url}-Error when call:`, err);
    return null;
  }
}
module.exports.getContractAbi = async (chainId, contractAddr) => {
  const url = `${EAR3_ROOT_API}/chains/getAbi?chainId=${chainId}&contractAddress=${contractAddr}`;
  try {
    const resp = await axios.get(url);
    //console.log(resp.data);
    return resp.data.data;
  } catch (err) {
    await processError(`Url:${url} -Error when get abi from server: `, err);
    return null;
  }
}
module.exports.getOrderByStatus = async (orderStatus) => {
  const path = 'deposits/list-game-deposits';
  const url = `${EAR3_ROOT_API}/${path}`;
  try {
    const resp = await axios.get(url,
      {
        headers: {
          'x-era3-api-key': GAME_API_KEY,
        }
      }
    );
    return resp.data;

  } catch (err) {
    await processError(`Url:${url} -Error when call: `, err);
    return null;
  }
}
module.exports.axiosPost = async (path, data, headers = {}) => {
  const url = `${EAR3_ROOT_API}/${path}`;
  try {
    const resp = await axios.post(url, data, { headers: headers })
    return resp;
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports.updateOrder = async (data) => {
  const path = 'deposits/complete-deposit';
  const headers = {
    'x-era3-api-key': GAME_API_KEY
  }
  try {
    const resp = await this.axiosPost(path, data, headers);
    return resp;
  } catch (error) {
    console.error(error);
    return null;
  }

}
module.exports.taskHeathy = async (data) => {
  const url = `games/ping-game`;
  const headers = {
    'x-era3-api-key': GAME_API_KEY
  }
  try {
    const resp = await this.axiosPost(url, data, headers);
    return 'Ok'
  } catch (error) {
    console.error(error);
    return 'Fail';
  }
}