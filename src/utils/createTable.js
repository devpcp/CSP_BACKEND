
// const User = require("../models/Users/User")
// const sequelize = require('../db')

// // var create = await createStock(request, 'AHQ1')
// // if (create.status == 'faild') {
// //     return create
// // }


// const createWarehouses = async (request, table_name) => {

//     table_name = table_name.toLowerCase()

//     const table_create = await sequelize.query(`
//     CREATE TABLE app_shops_datas.dat_shopcode`+ table_name + `_warehouses
//     (
//         id uuid NOT NULL DEFAULT uuid_generate_v4(),
//         code_id character varying COLLATE pg_catalog."default" NOT NULL,
//         name json NOT NULL,
//         shelf json,
//         created_by uuid NOT NULL DEFAULT '`+ request.id + `'::uuid,
//         created_date timestamp without time zone NOT NULL DEFAULT now(),
//         updated_by uuid,
//         updated_date timestamp without time zone,
//         CONSTRAINT dat_shopcode`+ table_name + `_warehouses_pkey PRIMARY KEY (id),
//         CONSTRAINT fk_wh_shopcode`+ table_name + `_created_by_user_id FOREIGN KEY (created_by)
//             REFERENCES systems.sysm_users (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID,
//         CONSTRAINT fk_wh_shopcode`+ table_name + `_updated_by_user_id FOREIGN KEY (updated_by)
//             REFERENCES systems.sysm_users (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID
//     )`
//         , { raw: true })
//     return table_create
// }

// const createStock = async (request, table_name) => {

//     table_name = table_name.toLowerCase()
//     // const user = await User.findAll();
//     const table_create = await sequelize.query(`
//     CREATE TABLE app_shops_datas.dat_shopcode`+ table_name + `_stock_products_balances
//     (
//         id uuid NOT NULL DEFAULT uuid_generate_v4(),
//         shop_id uuid NOT NULL,
//         product_id uuid NOT NULL,
//         warehouse_detail json NOT NULL,
//         balance bigint NOT NULL,
//         balance_date timestamp without time zone NOT NULL,
//         created_by uuid NOT NULL DEFAULT '`+ request.id + `'::uuid,
//         created_date timestamp without time zone NOT NULL DEFAULT now(),
//         updated_by uuid,
//         updated_date timestamp without time zone,
//         CONSTRAINT dat_shopcode`+ table_name + `_stock_products_balances_pkey PRIMARY KEY (id),
//         CONSTRAINT fk_spb_shopcode`+ table_name + `_created_by_user_id FOREIGN KEY (created_by)
//             REFERENCES systems.sysm_users (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID,
//         CONSTRAINT fk_spb_shopcode`+ table_name + `_product_id FOREIGN KEY (product_id)
//             REFERENCES app_datas.dat_products (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID,
//         CONSTRAINT fk_spb_shopcode`+ table_name + `_shop_id FOREIGN KEY (shop_id)
//             REFERENCES app_datas.dat_shops_profiles (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID,
//         CONSTRAINT fk_spb_shopcode`+ table_name + `_updated_by_user_id FOREIGN KEY (updated_by)
//             REFERENCES systems.sysm_users (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//             NOT VALID
//     )`
//         , { raw: true })
//     return table_create
// }

// const createInventoryManagement = async (request, table_name) => {

//     table_name = table_name.toLowerCase()

//     const table_create = await sequelize.query(`
//     CREATE TABLE app_shops_datas.dat_shopcode`+ table_name + `_inventory_management_logs
//     (
//         id uuid NOT NULL DEFAULT uuid_generate_v4(),
//         shop_id uuid NOT NULL,
//         product_id uuid NOT NULL,
//         warehouse_detail json NOT NULL,
//         amount bigint NOT NULL,
//         import_date timestamp without time zone NOT NULL,
//         status smallint,
//         doc_num character varying COLLATE pg_catalog."default",
//         created_by uuid NOT NULL DEFAULT '`+ request.id + `'::uuid,
//         created_date timestamp without time zone NOT NULL DEFAULT now(),
//         CONSTRAINT dat_shopcode`+ table_name + `_inventory_management_logs_pkey PRIMARY KEY (id),
//         CONSTRAINT fk_iml_shopcode`+ table_name + `_created_by_user_id FOREIGN KEY (created_by)
//             REFERENCES systems.sysm_users (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION,
//         CONSTRAINT fk_iml_shopcode`+ table_name + `_product_id FOREIGN KEY (product_id)
//             REFERENCES app_datas.dat_products (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION,
//         CONSTRAINT fk_iml_shopcode`+ table_name + `_shop_id FOREIGN KEY (shop_id)
//             REFERENCES app_datas.dat_shops_profiles (id) MATCH SIMPLE
//             ON UPDATE NO ACTION
//             ON DELETE NO ACTION
//     )`
//         , { raw: true })
//     return table_create
// }
// module.exports = { createWarehouses, createStock, createInventoryManagement }