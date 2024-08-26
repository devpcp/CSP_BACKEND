

const json = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['rdcode'],
        properties: {
            rdcode: { type: 'string' }
        }
    },
    body: {
        type: 'array', items: {
            type: 'object',
            required: ['ผู้เกี่ยวข้อง'],
            properties: {
                ผู้เกี่ยวข้อง: { type: 'string', example: '' },
                ประเภทธุรกิจ: { nullableKey: { type: ['string', ''] }, example: "ร้่าน" },
                เลขประจำตัว: { nullableKey: { type: ['string', ''] }, example: "" },
                ติดต่อ: { nullableKey: { type: ['string', ''] }, example: "" },
                ADCode: { nullableKey: { type: ['string', ''] }, example: "" }
            },
        }
    },
    tags: ['MatchCustomerDealer'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const file = {
    // consumes: ['multipart/form-data', 'application/json'],
    // body: {
    //     type: 'object',
    //     // required: ['file'],
    //     properties: {
    //         // file: { type: 'string' },
    //         // product_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
    //         // model_name: {
    //         //     type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
    //         //         th: 'string',
    //         //         en: 'string'
    //         //     }
    //         // }
    //     }
    // },
    tags: ['MatchCustomerDealer'],
    security: [
        {
            "apiKey": []
        }
    ]
}
module.exports = {
    file,
    json
}