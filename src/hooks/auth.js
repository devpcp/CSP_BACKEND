const jwt = require('jsonwebtoken');
const customError = require('../utils/custom-error');
const authErrors = require('../errors/auth');
const config = require('../config');
const { handleSaveLog } = require('../handlers/log');
const User = require('../models/model').User;

const validateHeadersAuth = async (request) => {
    const authToken = request.headers['authorization'];
    if (!authToken) {
        await handleSaveLog(request, [['verify token'], 'Unauthorized']);
        customError(authErrors.Unauthorized);
    }

    const accessToken = authToken.split(' ')[1];
    if (!accessToken) {
        await handleSaveLog(request, [['verify token'], 'Unauthorized']);
        customError(authErrors.Unauthorized);
    }

    return accessToken;
}

const verifyAccessToken = async (request) => {
    try {
        const accessToken = await validateHeadersAuth(request)
        const decoded = Object(jwt.verify(accessToken, config.secret.accessToken))

        // check logout 
        const check = await User.findAll({
            where: { id: decoded.aud }
        });
        if (check[0].login_status == 0) {
            return customError(authErrors.Unauthorized);
        }

        request.id = decoded.aud;

        return true;
    } catch (error) {
        await handleSaveLog(request, [['verify token'], 'Unauthorized']);
        customError(authErrors.Unauthorized);
    }
}

module.exports = {
    verifyAccessToken: require("../preHandlers/preHandler.Default.VerifyAccessToken")
}