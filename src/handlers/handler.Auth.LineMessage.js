const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { isPlainObject } = require("lodash");
const { handleSaveLog } = require("./log");
const axios = require("axios")
const UsersProfiles = require('../models/UsersProfiles/UsersProfiles')
const ShopsProfiles = require('../models/ShopsProfiles/ShopsProfiles')

const handlerAuthLineMessage = async (request) => {

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

        let line_user_id = request.params.line_user_id
        let token = shop_profile.shop_config?.line_message_token


        let test1 = await axios.post('https://api.line.me/v2/bot/message/multicast',
            {
                "to": [line_user_id],
                ...request.body
            }
            , {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            }
        ).catch(async (err) => {
            return utilSetFastifyResponseJson('failed', err)
        })

        return utilSetFastifyResponseJson('success', test1.data)
    } catch (error) {
        throw new Error(error)

    }


};


module.exports = handlerAuthLineMessage;