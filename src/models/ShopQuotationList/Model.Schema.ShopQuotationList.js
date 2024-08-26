/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/shopQuotationList/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลรายการใบเสนอราคา - Quotation List (QU List) แบบระบุรหัสหลักตารางข้อมูล (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูล (Id)',
                type: 'string',
                format: 'uuid',
                allowNull: false,
                default: null
            }
        }
    },
    tags: ['ShopQuotationList'],
    security: [
        {
            "apiKey": []
        }
    ]
};

module.exports = {
    del
};