const {
    ShopsProfiles
} = require("../models/model");
const utilGetModelsAndShopModels = require("./util.GetModelsAndShopModels");

const utilSetModelsAndShopModels = async () => {
    const findShopCodeIds = await ShopsProfiles.findAll({
        attributes: ['shop_code_id']
    });

    /**
     * @type {string[]}
     */
    const shop_code_ids = [];
    let tasks = [];
    for (let index = 0; index < findShopCodeIds.length; index++) {
        const findShopCodeId = findShopCodeIds[index];
        const table_name = findShopCodeId.get('shop_code_id')?.toLowerCase();
        shop_code_ids.push(table_name);
        tasks.push(
            (
                async () => {
                    utilGetModelsAndShopModels(table_name);
                    console.log(JSON.stringify({"level":30,"time": Date.now(),"msg": `Set Models and ShopModels: ${table_name}`}));
                }
            )()
        );
    }
    await Promise.all(tasks);

    console.log(JSON.stringify({"level":30,"time": Date.now(),"msg": `Set Models and ShopModels finished!`}));
    return shop_code_ids;
};


module.exports = utilSetModelsAndShopModels;