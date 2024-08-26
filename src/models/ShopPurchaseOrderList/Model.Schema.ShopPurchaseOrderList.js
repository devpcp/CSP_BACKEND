const apiTags = ['ShopPurchaseOrderList'];
const apiSecurity = [
    {
        "apiKey": []
    }
];


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/PurchaseOrderList/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลรายการใบสั่งซื้อ - PurchaseOrder List (PO List) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
    tags: apiTags,
    security: apiSecurity
};


module.exports = {
    del
};