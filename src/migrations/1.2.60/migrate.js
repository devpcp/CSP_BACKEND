const _001_migrate_20221020_001_CSP_554 = require("./migrate_20221020_001_CSP-554");
const _002_migrate_20221020_001_CSP_557 = require("./migrate_20221020_001_CSP-557");
const _003_migrate_20221026_001_CSP_636 = require("./migrate_20221026_001_CSP-636");
const _004_migrate_20221028_001_CSP_463 = require("./migrate_20221028_001_CSP-463");
const _005_migrate_20221103_001_CSP_544 = require("./migrate_20221103_001_CSP-544");
const _006_migrate_20221103_001_CSP_562 = require("./migrate_20221103_001_CSP-562");
const _007_migrate_20221104_001_CSP_636 = require("./migrate_20221104_001_CSP-636");
const _008_migrate_20221107_001_CSP_543 = require("./migrate_20221107_001_CSP-543");
const _009_migrate_20221107_001_CSP_549 = require("./migrate_20221107_001_CSP-549");

const startMigrations = async (migrations = []) => {
    for (let index = 0; index < migrations.length; index++) {
        const element = migrations[index];
        await element()
            .then(r => console.log(r))
            .catch(e => console.error(e));
    }
};

startMigrations([
    _001_migrate_20221020_001_CSP_554,
    _002_migrate_20221020_001_CSP_557,
    _003_migrate_20221026_001_CSP_636,
    _004_migrate_20221028_001_CSP_463,
    _005_migrate_20221103_001_CSP_544,
    _006_migrate_20221103_001_CSP_562,
    _007_migrate_20221104_001_CSP_636,
    _008_migrate_20221107_001_CSP_543,
    _009_migrate_20221107_001_CSP_549
]);
