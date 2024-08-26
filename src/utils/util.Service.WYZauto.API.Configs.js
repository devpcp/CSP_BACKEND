const {
    config_sys_third_party_api_name_wyzauto,
    config_sys_third_party_api_url_path_wyzauto_action_post_products,
    config_sys_third_party_api_url_path_wyzauto_action_get_products,
    config_sys_third_party_api_url_path_wyzauto_action_get_bysku_products,
    config_sys_third_party_api_url_path_wyzauto_action_disable_all_products
} = require("../config");

const ThirdPartyApiConnectData = require("../models/model").ThirdPartyApiConnectData;
const ThirdPartyApi = require("../models/model").ThirdPartyApi;


const utilServiceWYZautoAPIConfigs = async (shop_id) => {
    const findWYZAutoAPI = async (shop_id, url_path) => {
        const findAPI = await ThirdPartyApiConnectData.findOne({
            include: [
                {
                    model: ThirdPartyApi,
                    where: {
                        third_party_api_name: config_sys_third_party_api_name_wyzauto,
                        isuse: 1,
                    }
                }
            ],
            where: {
                shop_id: shop_id
            }
        });

        if (!findAPI) {
            return null;
        }
        else {
            const objURL = new URL(
                (findAPI.get('ThirdPartyApi')['url_api_link'])
                    .replace(/\/+$/, '')
            );
            objURL.pathname = (objURL.pathname + '/' + url_path.replace(/^\/+/, '')).replace(/\/+/, '/');

            const url = objURL.href;
            const authorization = findAPI.get('api_key');

            if (authorization && url) {
                return {
                    url: url,
                    authorization: authorization
                };
            }
            else {
                return null;
            }
        }
    }

    const [
        api_wyzauto_action_post_products,
        api_wyzauto_action_get_products,
        api_wyzauto_action_get_bysku_products,
        api_wyzauto_action_disable_all_products,
    ] = await Promise.all([
        findWYZAutoAPI(shop_id, config_sys_third_party_api_url_path_wyzauto_action_post_products),
        findWYZAutoAPI(shop_id, config_sys_third_party_api_url_path_wyzauto_action_get_products),
        findWYZAutoAPI(shop_id, config_sys_third_party_api_url_path_wyzauto_action_get_bysku_products),
        findWYZAutoAPI(shop_id, config_sys_third_party_api_url_path_wyzauto_action_disable_all_products),
    ]);

    return {
        api_wyzauto_action_post_products: api_wyzauto_action_post_products,
        api_wyzauto_action_get_products: api_wyzauto_action_get_products,
        api_wyzauto_action_get_bysku_products: api_wyzauto_action_get_bysku_products,
        api_wyzauto_action_disable_all_products: api_wyzauto_action_disable_all_products,
    };
};


module.exports = utilServiceWYZautoAPIConfigs;