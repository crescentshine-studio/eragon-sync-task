module.exports = (sequelize, Sequelize) => {
    const Deposit = sequelize.define("Deposit", {
        orderId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        gameId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        playerId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        actualAmount: {
            type: Sequelize.INTEGER,
            field: 'actual_amount'
        },
        currentRate: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: true,
        updatedAt: false,
        tableName: 'Deposit'
    });
    return Deposit;
};