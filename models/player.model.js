const { Sequelize, QueryTypes } = require("sequelize");
const { processError } = require('../utils/error.util');
const { loadConfig } = require('../utils/load-config');
module.exports.updatePointInGame = async (dbGame, playerId, rawQueryName, point) => {
    const fileName = 'sql';
    const sqls = loadConfig(fileName);
    try {
        // first insert to account delete
        const [rows, result] = await dbGame.sequelize.query(sqls.Deposite[rawQueryName], {
            replacements: {
                playerId: playerId,
                newpoint: point
            },
            type: QueryTypes.RAW
        });
        console.log("rows effect:", rows, "result:", result);
        if (result && result.changedRows > 0) {
            return true;
        } else {
            console.error("Cannot found player:", playerId);
        }
        return false;
    } catch (error) {
        await processError('Error when update point in game:', error);
        return false;
    }
}
module.exports.createPlayer = async (dbGame, playerId, point) => {
    try {
        let result = await dbGame.Player.findOne({
            where: {
                pId: playerId
            }
        });
        console.log(result);
        if (!result) {
            // first insert to account delete
            result = await dbGame.Player.create({
                pId: playerId,
                point: parseInt(point)
            });
        }
        return result;
    } catch (error) {
        await processError('Error when create player:', error);
        return null;
    }
}