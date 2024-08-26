const print_out_pdf = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    querystring: {
        type: 'object',
        required: [],
        properties: {
            price_use: { type: 'string', default: 'true', enum: ['true', 'false'], comment: 'กรณีไม่เอาราคา รวมทั้งราคา รวมต่าง ๆ' },
            doc_type_name: { type: 'string', comment: 'ชื่อเอกสาร ถ้าไม่ส่งจะเป็น default ของเอกสารนัั้น ๆ ' },
            foot_sign_left: { type: 'string', comment: 'custom wording ผู้รับเงิน' },
            foot_sign_right: { type: 'string', comment: 'custom wording ผู้จ่ายเงิน' },
            foot_date_left: { type: 'string', comment: 'custom wording วันที่ฝั่งซ้าย' },
            foot_date_right: { type: 'string', comment: 'custom wording วันที่ฝั่งขวา' },
            doc_type_id: { type: 'string', default: undefined, comment: '' },
            vehicle_data_show: { type: 'boolean', default: true, comment: 'โชว์ในส่วนของข้อมูลยานพาหนะ' },
            doc_date_show: { type: 'boolean', default: true, comment: 'โชว์ในส่วนของวันที่เอกสาร' }

        }
    },
    tags: ['PrintOut'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const print_out_pdf_tax_invoice = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    querystring: {
        type: 'object',
        required: ['abb_inv'],
        properties: {
            abb_inv: { type: 'number', default: 0, enum: [0, 1], comment: '0 คืออย่างย่อ 1 คือเต็มรูป' },
        }
    },
    tags: ['PrintOut'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const download = {
    tags: ['PrintOut'],
}

module.exports = {
    print_out_pdf, download, print_out_pdf_tax_invoice
}