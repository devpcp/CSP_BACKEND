const { handleSaveLog } = require("./log");
const fs = require('fs');

const handleDownloadFile = async (request, reply) => {
    const action = 'down load file';

    try {
        /**
         * @type {string}
         */
        const file_name = request.query.file_name;
        const file_name_cut = file_name.split("___")[1];
        let data = await reply.download(file_name, file_name_cut);

        fs.unlinkSync("src/assets/" + file_name);

        await handleSaveLog(request, [[action, file_name], '']);

        return data;
    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        throw error;
    }
};

module.exports = handleDownloadFile;