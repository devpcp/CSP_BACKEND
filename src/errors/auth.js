const { CustomErrorParams } = require('../utils/custom-error')

const AuthInvalidUsername = {
    message: 'Unauthorized',
    status: 'AUTH001',
    statusCode: 401
}

const Unauthorized = {
    message: 'Unauthorized',
    status: 'failed',
    statusCode: 401,
    data: 'Unauthorized'
}

const Forbidden = {
    message: 'Forbidden',
    status: 'failed',
    statusCode: 403,
    data: 'Forbidden'
}

module.exports = {
    Unauthorized,
    Forbidden
}