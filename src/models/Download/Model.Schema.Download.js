
const download = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['file_name'],
        properties: {
            file_name: { type: 'string', default: '', description: 'ชื่อไฟล์หรือ path ไฟล์ ที่ api gen file return มา' },
        }
    },
    tags: ['Download'],
    // security: [
    //     {
    //         "apiKey": []
    //     }
    // ]

}

module.exports = {
    download
}