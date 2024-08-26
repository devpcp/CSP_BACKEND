const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: 'all'
};

const start_date = {
    description: 'ข้อมูลวันที่เริ่มต้น\n- รูปแบบ YYYY-MM-DD\n- หากไม่ได้ใส่จะเอาข้อมูลวันที่แรกของเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}

const end_date = {
    description: 'ข้อมูลวันที่สิ้นสุด\n- รูปแบบ YYYY-MM-DD\n- หากไม่ได้ใส่จะเอาข้อมูลวันที่สุดท้ายของเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}

const start_year_month = {
    description: 'ข้อมูลปีและเดือน ที่เป็นรูปแบบ YYYY-MM\n- หากไม่ใส่ข้อมูลจะใช้เป็นของปีและเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}
const end_year_month = {
    description: 'ข้อมูลปีและเดือน ที่เป็นรูปแบบ YYYY-MM\n- หากไม่ใส่ข้อมูลจะใช้เป็นของปีและเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}

const start_year = {
    description: 'ข้อมูลปีและเดือน ที่เป็นรูปแบบ YYYY\n- หากไม่ใส่ข้อมูลจะใช้เป็นของปีและเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}
const end_year = {
    description: 'ข้อมูลปีและเดือน ที่เป็นรูปแบบ YYYY\n- หากไม่ใส่ข้อมูลจะใช้เป็นของปีและเดือนนี้',
    type: 'string',
    nullable: true,
    default: ''
}

const config_ = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const brand_sales = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const daily_info = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const compare_monthly_sales = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year,
            end_year
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const compare_sales_target = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const number_of_user_this_month = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const type_sales = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const daialy_finance_info = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const number_of_income_this_month = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const number_of_sales_tire_amount_by_date_range = {
    description: 'จำนวนยางที่ขาย ตาม Date Range',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const compare_yearly_sales_tire_amount = {
    comment: 'จำนวนยางที่ขาย ตามรายปี',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year,
            end_year
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const compare_yearly_sales_spare_amount = {
    comment: 'จำนวนอะไหล่ที่ขาย ตามรายปี',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year,
            end_year
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const number_of_sales_tire_amount_by_month = {
    comment: 'จำนวนยางที่ขาย ตามเดือน',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const number_of_sales_spare_amount_by_month = {
    comment: 'จำนวนอะไหล่ที่ขาย ตามเดือน',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const top_size_sales = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const top_type = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month,
            start_date,
            end_date
        }
    },
    params: {
        required: ['which'],
        type: 'object',
        properties: {
            which: { type: 'string', default: null, enum: ['tire', 'spaire', 'service'] }
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const top_customer = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            start_year_month,
            end_year_month,
            start_date,
            end_date
        }
    },
    tags: ['Dashboard'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    config_, brand_sales, daily_info, compare_monthly_sales
    , compare_sales_target, number_of_user_this_month, type_sales
    , daialy_finance_info, number_of_income_this_month
    , number_of_sales_tire_amount_by_date_range
    , compare_yearly_sales_tire_amount, compare_yearly_sales_spare_amount
    , number_of_sales_tire_amount_by_month, number_of_sales_spare_amount_by_month
    , top_size_sales, top_type, top_customer


}