
const { TRANSACTION_STATUS } = require('./transaction-status');
const { TRANSACTION_TYPE } = require('./transaction-type');
const { processError } = require('../utils/error.util');
module.exports.getTransaction = async (db, txHash) => {
    let result = null;
    try {
        result = await db.Transaction.findOne({
            where: {
                txHash: txHash
            },
            attributes: ['txHash', 'status']
        });
        return result;
    } catch (error) {
        await processError(`Get transaction by txHash:${txHash} error:`, error);
        return null;
    }
}
module.exports.saveTransaction = async (db, txHash, eventName, data) => {
    let result = null;
    try {
        result = await db.Transaction.create({
            txHash: txHash,
            txType: TRANSACTION_TYPE.DEPOSITE,
            status: TRANSACTION_STATUS.CONFIRMED,
            currency: data.currency,
            eventName: eventName,
            data: JSON.stringify(data)
        });
        return result;
    } catch (error) {
        await processError(`Save transaction by txHash:${txHash} error:`, error);
        return null;
    }
}
module.exports.isTxTracking = async (db, txHash) => {
    const tx = await this.getTransaction(db, txHash);
    if (tx) {
        return true;
    }
    return false;
}
module.exports.isProccedTransaction = async (db, txHash) => {
    const tx = await this.getTransaction(db, txHash);
    if (tx && tx.dataValues.status == TRANSACTION_STATUS.COMPLETED) {
        return true;
    }
    return false;
}
module.exports.updateTxCompleted = async (dbTask, txHash) => {
    try {
        const [updated] = await dbTask.Transaction.update({
            status: TRANSACTION_STATUS.COMPLETED
        }, {
            where: {
                txHash: txHash
            }
        });
        return updated > 0;
    } catch (error) {
        await processError(`Update tx error:`, error);
        return false;
    }
}
module.exports.getProcessingTask = async (dbTask) => {
    let result = null;
    try {
        result = await dbTask.Transaction.findAll({
            where: {
                status: TRANSACTION_STATUS.CONFIRMED
            },
            attributes: ['txHash', 'data', 'txType', 'currency']
        });
        return result;
    } catch (error) {
        await processError(`List processing tx error:`, error);
        return null;
    }
}
