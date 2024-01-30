var { Sequelize } = require("sequelize");
const { loadConfig } = require('./load-config');
let dbGame = null;
let dbTask = null;
module.exports.connectDbAccount = async () => {
    if (dbGame) {
        return dbGame;
    }
    const dbConfigFileName = 'dbgame.config';
    const dbConfig = loadConfig(dbConfigFileName);
    dbGame = {};
    dbGame.Sequelize = Sequelize;
    let sequelize = new Sequelize(dbConfig.dbName, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: getDialectByDb(dbConfig.dbType),
        dialectOptions: {
            connectTimeout: 3000
        },
        pool: {
            max: 15,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: true,
        retry: {
            match: [
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /ESOCKETTIMEDOUT/,
                /EHOSTUNREACH/,
                /EPIPE/,
                /EAI_AGAIN/,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: 5
        }
    });
    await sequelize.authenticate();
    dbGame.sequelize = sequelize;
    dbGame.Player = require('../entites/player.entites')(sequelize, Sequelize);
    dbGame.Player.sync();
    return dbGame;
}
module.exports.connectSqlite = async () => {
    if (dbTask) {
        return dbTask;
    }
    dbTask = {};
    dbTask.Sequelize = Sequelize;
    let sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './db/track.sqlite3'
    });
    await sequelize.authenticate();
    dbTask.sequelize = sequelize;
    dbTask.Transaction = require('../entites/transaction.entities')(sequelize, Sequelize);
    dbTask.Deposite = require('../entites/deposite.entities')(sequelize, Sequelize);
    dbTask.Transaction.sync();
    dbTask.Deposite.sync();
    return dbTask;
}
function getDialectByDb(dbType) {
    switch (String(dbType).toLowerCase()) {
        case "Mysql".toLowerCase(): {
            return "mysql"
        }
        case "Mariadb".toLowerCase(): {
            return "mariadb"
        }
        case "MSSQL".toLowerCase(): {
            return "mssql"
        }
        case "Postgres".toLowerCase(): {
            return "postgres"
        }
        case "Oracle".toLowerCase(): {
            return "oracle"
        }
        case "Db2".toLowerCase(): {
            return "db2"
        }
    }

}