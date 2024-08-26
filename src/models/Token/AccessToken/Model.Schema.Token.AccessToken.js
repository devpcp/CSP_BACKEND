const access_token = {
    description: 'รับ Access Token ใหม่',
    body: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
            refresh_token: {
                type: 'string',
                format: 'uuid',
                description: 'ใส่ค่า refresh_token ที่เป็น string[uuid] เข้าไป',
                example: 'ca280ffd-5c68-4723-a963-26303cdb6f31'
            }
        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
};

module.exports = {
    access_token,
};