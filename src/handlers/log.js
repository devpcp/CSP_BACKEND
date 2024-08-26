const _ = require("lodash");
const { isNull, isUUID } = require('../utils/generate')
const DeviceDetector = require("device-detector-js");
const Log = require("../models/model").Log;

/**
 * @typedef {string} ISystemAction - An action to save into log
 * @typedef {string} ISystemError - An error to save into log
 */

/**
 * A handler for save log into database
 * @template T
 * @param {import("fastify").FastifyRequest<T> | import("fastify").FastifyRequest | import("../types/type.Default.Fastify").FastifyRequestDefault<T> | import("../types/type.Default.Fastify").FastifyRequestDefault} req
 * @param {import("../types/type.Handler.Log").IhandlerLogData} data
 * @return {Promise<Log>}
 */
const handleSaveLog = async (req, data) => {
    const ua = req.headers['user-agent'];
    const deviceDetector = new DeviceDetector();
    const device = await deviceDetector.parse(ua);
    const ip = req.headers['HTTP_X_REAL_IP'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let sysm_type = '';
    if (ua) {
        if (ua.toString().includes('Postman')) {
            sysm_type = 'Postman'
        } else if (ua.includes('( ')) {
            sysm_type = ua.split(' (')[1].split(') ')[0]
        }
    }

    let action_json = {};
    if (data[0][0]) { action_json.action = data[0][0]; }
    if (data[0][1]) { action_json.id = data[0][1]; }
    if (data[0][2]) { action_json.data = data[0][2]; }
    if (data[0][3]) { action_json.before_update = data[0][3]; }
    action_json = JSON.stringify(action_json)

    /**
     * @param {Error|String|any} errorInstance
     * @return {string}
     */
    const extractErrorInstance = (errorInstance) => {
        if (_.isError(errorInstance)) {
            return 'error: ' + JSON.stringify({
                name: errorInstance.name,
                message: errorInstance.message,
                stack: errorInstance.stack || null
            });
        }
        else {
            return String(errorInstance || '');
        }
    };

    return await Log.create({
        user_id: (isUUID(req.id) === true) ? req.id : null,
        url: req.protocol + '://' + req.hostname + req.url,
        action: action_json,
        error: extractErrorInstance(data[1]),
        ip: ip,
        mac_id: '',
        device: (isNull(device.device)) ? "postman" : device.device.type + ' ' + device.device.brand,
        browser: (isNull(device.device)) ? "postman" : device.client.name + ' ' + device.client.version,
        os: (isNull(device.device)) ? "postman" : device.os.name + ' ' + device.os.version,
        sysm_type: sysm_type
    });
}

const get_browser = async (ua) => {

    var user_agent = ua

    browser = "Unknown Browser";

    var browser_array = {
        '/msie/i': 'Internet Explorer',
        '/trident/i': 'Internet Explorer',
        '/firefox/i': 'Firefox',
        '/safari/i': 'Safari',
        '/chrome/i': 'Chrome',
        '/edge/i': 'Edge',
        '/opera/i': 'Opera',
        '/netscape/': 'Netscape',
        '/maxthon/i': 'Maxthon',
        '/knoqueror/i': 'Konqueror',
        '/ubrowser/i': 'UC Browser',
        '/mobile/i': 'Safari Browser',
    };

    await new Promise((resolve, rejct) => {

        Object.keys(browser_array).forEach((key, index) => {
            console.log(key, browser_array[key], index);
            key = key.split('/')
            regex = new RegExp(key[1])
            if (regex.test(user_agent) == true) {
                browser = browser_array['/' + key[1] + '/i'];
            }

            if (key[1] === 'mobile') resolve();
        });
    })

    return browser;
}

const get_os = async (ua) => {
    var user_agent = ua
    var os_platform = "Unknown OS Platform";

    var os_array = {
        '/windows nt 10/i': 'Windows 10',
        '/windows nt 6.3/i': 'Windows 8.1',
        '/windows nt 6.2/i': 'Windows 8',
        '/windows nt 6.1/i': 'Windows 7',
        '/windows nt 6.0/i': 'Windows Vista',
        '/windows nt 5.2/i': 'Windows Server 2003/XP x64',
        '/windows nt 5.1/i': 'Windows XP',
        '/windows xp/i': 'Windows XP',
        '/windows nt 5.0/i': 'Windows 2000',
        '/windows me/i': 'Windows ME',
        '/win98/i': 'Windows 98',
        '/win95/i': 'Windows 95',
        '/win16/i': 'Windows 3.11',
        '/macintosh|mac os x/i': 'Mac OS X',
        '/mac_powerpc/i': 'Mac OS 9',
        '/linux/i': 'Linux',
        '/ubuntu/i': 'Ubuntu',
        '/iphone/i': 'iPhone',
        '/ipod/i': 'iPod',
        '/ipad/i': 'iPad',
        '/android/i': 'Android',
        '/blackberry/i': 'BlackBerry',
        '/webos/i': 'Mobile',
    };

    await new Promise((resolve, rejct) => {

        Object.keys(os_array).forEach((key, index) => {
            console.log(key, os_array[key], index);
            key = key.split('/')
            regex = new RegExp(key[1])
            if (regex.test(user_agent) == true) {
                os_platform = os_array['/' + key[1] + '/i'];
            }

            if (key[1] === 'webos') resolve();
        });


    })

    return os_platform;
}

module.exports = {
    handleSaveLog
}