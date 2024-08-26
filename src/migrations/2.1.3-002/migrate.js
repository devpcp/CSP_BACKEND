const { Transaction } = require("sequelize");
const config = require("../../config");
const sequelize = require("../../db");

const _001_migrate_20230324_001_CSP_778 = require("./_001_migrate_20230324_001_CSP-778");

const startMigrations = async (migrations = []) => {
    await sequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            for (let index = 0; index < migrations.length; index++) {
                const element = migrations[index];
                await element({ transaction: transaction })
                    .then(r => console.log(r))
                    .catch(e => {
                        console.error(e);
                        throw e;
                    });
            }
        }
    )
};

startMigrations([
    _001_migrate_20230324_001_CSP_778,
]);
