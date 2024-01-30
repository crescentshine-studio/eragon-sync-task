const ethers = require("ethers");
const { getProcessingTask, updateTxCompleted } = require('./models/transaction.model');
const { delay } = require('./utils/general.util');
const { connectSqlite, connectDbAccount } = require('./utils/db-connection.util');
const { updatePointInGame, createPlayer } = require('./models/player.model');
const { TRANSACTION_TYPE } = require('./models/transaction-type');
const { taskHeathy, updateOrder } = require('./utils/request.util');
let index = 1;
async function processSyncJob(dbTask, dbGame) {
    const timeTakenProceess = `Update game Db-Round:${index}-Time`;
    console.time(timeTakenProceess);
    const rows = await getProcessingTask(dbTask);
    //console.log(rows);
    for (const row of rows) {
        let result = null;
        const onchainData = JSON.parse(row.dataValues.data);
        const txType = row.dataValues.txType;
        const txHash = row.dataValues.txHash;
        console.log('Update game db for tx:', txHash);
        switch (txType) {
            case TRANSACTION_TYPE.DEPOSITE:
                result = await updatePointInGame(dbGame, parseInt(onchainData.playerId), row.dataValues.currency, parseInt(onchainData.actualAmount * onchainData.rate));
                break
            default:
                console.error(`Cannot implement for Tx type: ${txType}-Tx hash:${txHash}`);
        }
        //mark Tx is completed
        if (result == true) {
            result = await updateTxCompleted(dbTask, txHash);
            console.log(`Success mark Tx: ${txHash} is completed.`);
            //update status to backend
            if (result) {
                result = await updateOrder({
                    txHash: txHash
                });
                if (result) {
                    console.log('Success update status to backend api');
                } else {
                    console.error('Fail to update status to backend api.', txHash);
                }
            } else {
                console.error(`Fail to update tx status:`, txHash);
            }
        } else {
            console.error(`Fail to update balance for player:`, txHash);
        }
    }
    console.timeEnd(timeTakenProceess);
    index = index + 1;
}
(async () => {
    const dbTask = await connectSqlite();
    const dbGame = await connectDbAccount();
    try {
        while (true) {
            await processSyncJob(dbTask, dbGame);
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