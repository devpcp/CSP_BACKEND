require('dotenv').config() // Load ".env" file

const config = require('./src/config');
const path = require('path');
const db = require('./src/db');
const buildApp = require('./src/app');
const utilCreateDirectory = require('./src/utils/util.CreateDirectory');
const utilGetAssetsDirectoriesAvailable = require("./src/utils/util.GetAssetsDirectoriesAvailable");
const { checkConfigSendingSaleToMichelin } = require('./src/utils/utill.SendSaleToMichelin');
const { handleGroupAll } = require("./src/handlers/group");

/**
 * An array from set of preLoad to create directory of "src/assets/*"
 * @type {string[]}
 */
const assetsDirectory = utilGetAssetsDirectoriesAvailable();
assetsDirectory.forEach(element => {
    const creatingDirectoryPath = path.join(__dirname, 'src', 'assets', element);
    const objLogCreatingDirectoryPath = {
        level: 30,
        time: Date.now(),
        msg: `Creating directory: ${creatingDirectoryPath}`
    };
    console.info(JSON.stringify(objLogCreatingDirectoryPath));
    const createdDirectoryPath = utilCreateDirectory(creatingDirectoryPath);
    const objLogCreatedDirectoryPath = {
        level: 30,
        time: Date.now(),
        msg: `Created directory: ${createdDirectoryPath}`
    };
    console.info(JSON.stringify(objLogCreatedDirectoryPath));
});

/**
 * An options of fastify app instance
 * @type {import("fastify").FastifyServerOptions}
 */
const fastifyOptions = {
    logger: true,
};

const app = buildApp(fastifyOptions);

// Start app
db.authenticate()
    .then(() => {
        if (process.send) {
            const objLogCreatedDirectoryPath = {
                level: 30,
                time: Date.now(),
                msg: `Generating handleGroupAll cache...`
            };
            console.info(JSON.stringify(objLogCreatedDirectoryPath));
            handleGroupAll({ request: { query: {} } }, {}, { is_skipSaveLog: true })
                .then(() => {
                    app.listen(config.port, config.host)
                        .then(url => {
                            checkConfigSendingSaleToMichelin(url)
                        })
                        .then(() => {
                            if (process.send) {
                                const objLogCreatedDirectoryPath = {
                                    level: 30,
                                    time: Date.now(),
                                    msg: `Sending Signal to PM2: ready`
                                };
                                console.info(JSON.stringify(objLogCreatedDirectoryPath));
                                process.send('ready');
                            }
                            else {
                                const objLogCreatedDirectoryPath = {
                                    level: 30,
                                    time: Date.now(),
                                    msg: `No Send Signal to PM2, due to process.send is not defined`
                                };
                                console.info(JSON.stringify(objLogCreatedDirectoryPath));
                            }
                        });
                });
        }
        else {
            const objLogCreatedDirectoryPath = {
                level: 30,
                time: Date.now(),
                msg: `No generate handleGroupAll cache, due to process.send is not defined`
            };
            console.info(JSON.stringify(objLogCreatedDirectoryPath));

            app.listen(config.port, config.host)
                .then(url => {
                    checkConfigSendingSaleToMichelin(url)
                })
                .then(() => {
                    if (process.send) {
                        const objLogCreatedDirectoryPath = {
                            level: 30,
                            time: Date.now(),
                            msg: `Sending Signal to PM2: ready`
                        };
                        console.info(JSON.stringify(objLogCreatedDirectoryPath));
                        process.send('ready');
                    }
                    else {
                        const objLogCreatedDirectoryPath = {
                            level: 30,
                            time: Date.now(),
                            msg: `No Send Signal to PM2, due to process.send is not defined`
                        };
                        console.info(JSON.stringify(objLogCreatedDirectoryPath));
                    }
                });
        }
    })
