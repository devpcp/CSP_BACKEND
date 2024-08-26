const { Transaction } = require("sequelize");
const config = require("../../config");
const sequelize = require("../../db");

const _001_migrate_20230220_001_CSP_751 = require("./_001_migrate_20230220_001_CSP-751");
const _002_migrate_20230207_002_CSP_751 = require("./_002_migrate_20230207_002_CSP-751");
const _003_migrate_20230208_003_CSP_751 = require("./_003_migrate_20230208_003_CSP-751");
const _004_migrate_20230310_004_CSP_482 = require("./_004_migrate_20230310_004_CSP-482");
const _005_migrate_20230323_005_CSP_778 = require("./_005_migrate_20230323_005_CSP-778");
const _006_migrate_20230206_006_CSP_760 = require("./_006_migrate_20230206_006_CSP-760");
const _007_migrate_20230228_007_CSP_488 = require("./_007_migrate_20230228_007_CSP-488");
const _008_migrate_20230323_008_CSP_772 = require("./_008_migrate_20230323_008_CSP-772");

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
    _001_migrate_20230220_001_CSP_751,
    _002_migrate_20230207_002_CSP_751,
    _003_migrate_20230208_003_CSP_751,
    _004_migrate_20230310_004_CSP_482,
    _005_migrate_20230323_005_CSP_778,
    _006_migrate_20230206_006_CSP_760,
    _007_migrate_20230228_007_CSP_488,
    _008_migrate_20230323_008_CSP_772
]);
