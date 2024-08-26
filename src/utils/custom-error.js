class CustomError extends Error {
    status
    statusCode
    data

    constructor(message, status, statusCode = 500, data) {
        super(message)

        this.name = 'CustomError'
        this.message = message
        this.status = status
        this.statusCode = statusCode
        this.data = data
    }
}


const customError = ({
    message,
    status,
    statusCode,
    data
}) => {
    throw new CustomError(
        message,
        status,
        statusCode,
        data
    )
}

module.exports = customError