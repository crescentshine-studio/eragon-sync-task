const ethers = require("ethers");
const { getOrderByStatus, taskHeathy } = require("./utils/request.util");
const { isTxTracking, saveTransaction } = require('./models/transaction.model');
const { detailTransaction } = require('./utils/transaction.util');
const { delay } = require('./utils/general.util');
const { connectSqlite } = require('./utils/db-connection.util');
let index = 1;
async function getSyncJob(dbTask) {
    const orderStatus = "CONFIRMED";
    const orderResult = await getOrderByStatus(orderStatus);
    if (orderResult.statusCode == 200) {
        let orderIndex = 1;
        for await (const order of orderResult.data.docs) {
            console.log(order);
            let timeTakenProceess = `Validate & Parser Data-Round:${index}-Index:${orderIndex}-Time`;
            console.time(timeTakenProceess);
            // check job exist in db
            const track = await isTxTracking(dbTask, order.txHash);
            if (track == true) {
                console.log(`Tx:${order.txHash} has been tracking.`);
                orderIndex = orderIndex + 1;
                continue;
            }
            //validate tx on-chain and get result;
            const chainId = parseInt(order.chainId);
            let rpc = 'https://data-seed-prebsc-2-s2.bnbchain.org:8545';
            let provider = new ethers.JsonRpcProvider(rpc, undefined, {
                batchMaxCount: 1
            });
            const result = await detailTransaction(chainId, rpc, provider, order.contractAddress, order.txHash, order.eventName);
            //reset provider;
            provider.destroy();
            if (!result) {
                console.warn('Cannot fetch data from on-chain tx:', order.txHash, 'Result:', result);
                orderIndex = orderIndex + 1;
                continue;
            }
            //add tx for update db later
            const row = await saveTransaction(dbTask, order.txHash, order.eventName, result);
            if (row) {
                console.log(`Add ${order.txHash} to tracking successful.`);
            } else {
                console.error(`Add ${order.txHash} to tracking fail.`);
            }
            await delay(1 * 1000);
            console.timeEnd(timeTakenProceess);
            orderIndex = orderIndex + 1;
        }
        console.log(`Get Job from EAR3-API at round:${index}`);
        index = index + 1;
    }
}
(async () => {
    const dbTask = await connectSqlite();
    try {
        while (true) {
            await getSyncJob(dbTask);

            const ping = await taskHeathy({
                chainId: process.env.CHAIN_ID,
                gameId: process.env.GAME_ID
            });
            console.log('Ping to heathy api:', ping);
            await delay(30 * 1000);
        }
    } catch (error) {
        console.error(error);
    }
})();