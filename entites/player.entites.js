module.exports = (sequelize, Sequelize) => {
    const Player = sequelize.define("Player", {
        pId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        point: {
            type: Sequelize.INTEGER,
            field: 'in_game_point'
        }
    }, {
        timestamps: true,
        updatedAt: false,
        tableName: 'Player'
    });
    return Player;
};