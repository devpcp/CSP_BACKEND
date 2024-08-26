require("dotenv").config();
const schedule = require('node-schedule');
const _ = require("lodash");
const config = require('../config')
const {
    isUUID,
} = require("./generate");
const { handleSaveLog } = require("../handlers/log");
const fs = require('fs');

const deletePrintOutFile = async (url) => {

    const job = schedule.scheduleJob('00 00 00 * * *', async function () {
        var file
        fs.readdir('src/assets/printouts/', (err, files) => {
            if (err) throw err;

            for (const file_name of files) {
                fs.unlinkSync("src/assets/printouts/" + file_name)
            }
        });
    })
}



module.exports = { deletePrintOutFile }