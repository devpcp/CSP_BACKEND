const { Transaction } = require("sequelize");
const config = require("../../config");
const sequelize = require("../../db");

// const _migrate_20230206_001_CSP_760 = require("./migrate_20230206_001_CSP-760");
// const _002_migrate_20221209_001_CSP_646 = require("./migrate_20221209_001_CSP-646");
// const _migrate_20230228_001_CSP_488 = require("./migrate_20230228_001_CSP-488");

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
    // _migrate_20230206_001_CSP_760,
    // _002_migrate_20221209_001_CSP_646,
    // _migrate_20230228_001_CSP_488
]);
