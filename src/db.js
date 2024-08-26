const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    // timezone: "Asia/Bangkok",
    define: {
        createdAt: "created_date",
        updatedAt: "updated_date"
    },
    minifyAliases: true,
    pool: {
        max: 100
    },
    // retry: {
    //     match: [/ShareRowExclusiveLock/i],
    //     max: 3,
    //     backoffBase: 5000,
    //     backoffExponent: 1.5
    // },
    // logging: false
});

module.exports = sequelize