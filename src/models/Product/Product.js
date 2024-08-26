const Model = require("sequelize").Model;
const { DataTypes, literal, fn } = require("sequelize");
const db = require("../../db");

class Product extends Model { }

Product.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    product_code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'รหัสสินค้า',
        unique: "unique_product_code"
    },
    master_path_code_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "โค้ดรหัสสินค้าต้นฉบับ",
        unique: "unique_master_path_code_id"
    },
    custom_path_code_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "โค้ดรหัสสินค้าที่กำหนดขึ้นเอง",
        unique: "unique_custom_path_code_id"
    },
    product_name: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "ชื่อสินค้า"
    },
    product_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "รหัสตารางข้อมูลประเภทสินค้า",
        references: {
            model: 'mas_product_types',
            key: 'id'
        }
    },
    product_brand_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "รหัสตารางข้อมูลยี่ห้อสินค้า",
        references: {
            model: 'mas_product_brands',
            key: 'id'
        }
    },
    product_model_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "รุ่นสินค้า",
        references: {
            model: 'mas_product_model_types',
            key: 'id'
        }
    },
    rim_size: {
        type: DataTypes.NUMBER,
        allowNull: true,
        comment: "ความกว้างจากขอบยาง ใช้กับสินค้าประเภทยางรถ"
    },
    width: {
        type: DataTypes.NUMBER,
        allowNull: true,
        comment: "ความกว้าง"
    },
    hight: {
        type: DataTypes.NUMBER,
        allowNull: true,
        comment: "ความสูง"
    },
    series: {
        type: DataTypes.NUMBER,
        allowNull: true,
        comment: "ความสูงแก้มยาง ใช้กับสินค้าประเภทยางรถ"
    },
    load_index: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: "ดัชนีน้ำหนักสินค้า"
    },
    speed_index: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ดัชนีความเร็ว"
    },
    complete_size_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "รหัสตารางข้อมูลชื่อขนาดยาง",
        references: {
            model: 'mas_product_complete_sizes',
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: "90f5a0a9-a111-49ee-94df-c5623811b6cc",
        comment: "สร้างข้อมูลโดย",
        references: {
            model: 'sysm_users',
            key: 'id'
        }
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: fn('now'),
        comment: "สร้างข้อมูลวันที่"
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "ปรับปรุงข้อมูลโดย",
        references: {
            model: 'sysm_users',
            key: 'id'
        }
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "ปรับปรุงข้อมูลวันที่"
    },
    other_details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "ข้อมูลรายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น JSON Format"
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)"
    },
    wyz_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "โค้ด SKU อ้างอิง ของ WYZAuto"
    },
}, {
    sequelize: db,
    modelName: 'Product',
    schema: 'app_datas',
    tableName: 'dat_products',
    comment: 'ตารางข้อมูลสินค้า (ข้อมูลกลาง)'
});


module.exports = Product;