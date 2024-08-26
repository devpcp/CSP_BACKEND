const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { isPlainObject } = require("lodash");
const { handleSaveLog } = require("./log");
const axios = require("axios")
const UsersProfiles = require('../models/UsersProfiles/UsersProfiles')
const ShopsProfiles = require('../models/ShopsProfiles/ShopsProfiles')

const handlerAuthLineNotify = async (request) => {

    try {
        let user_profile = await UsersProfiles.findOne({ where: { user_id: request.id } })
        if (!user_profile) {
            throw new Error('user_profile not found')
        }
        let shop_profile = await ShopsProfiles.findOne(
            {
                where: { id: user_profile.shop_id }
            }
        )

        let token = shop_profile.shop_config?.line_notify_token
        let test1 = await axios.post(
            'https://notify-api.line.me/api/notify',
            request.body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                }
            }
        ).catch(async (err) => {
            return utilSetFastifyResponseJson('failed', err)
        })

        return utilSetFastifyResponseJson('success', test1.data)
    } catch (error) {
        throw new Error(error)

    }


};


module.exports = handlerAuthLineNotify;