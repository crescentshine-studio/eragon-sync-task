module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("Transaction", {
        txHash: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        txType: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.INTEGER
        },
        currency: {
            type: Sequelize.STRING
        },
        eventName: {
            type: Sequelize.STRING,
            field: 'event_name'
        },
        data: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: true,
        updatedAt: false,
        tableName: 'transaction_track'
    });
    return Transaction;
};