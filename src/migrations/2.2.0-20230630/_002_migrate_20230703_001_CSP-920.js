require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const moment = require("moment");
const { Transaction } = require("sequelize");
const db = require("../../db");
const initShopModel = require("../../models/model").initShopModel;
const ShopProfile = require("../../models/model").ShopsProfiles;
const ShopProduct = require("../../models/model").ShopProduct;
const utilGetShopStockDataBalance = require("../../utils/util.GetShopStockDataBalance");

const documentType = {
    "ServiceOrder": "7ef3840f-3d7f-43de-89ea-dce215703c16",
    "SalesOrder": "67c45df3-4f84-45a8-8efc-de22fef31978"
};

const documentVatType = {
    "IncludedVat": 1,
    "ExcludedVat": 2,
    "NonVat": 3
};
const documentVatTypeId = {
    "IncludedVat": "8c73e506-31b5-44c7-a21b-3819bb712321",
    "ExcludedVat": "fafa3667-55d8-49d1-b06c-759c6e9ab064",
    "NonVat": "52b5a676-c331-4d03-b650-69fc5e591d2c"
};
const vatTypeRate = {
    "IncludedVat": 7,
    "ExcludedVat": 7,
    "NonVat": 0
};
const superAdminUserId = "90f5a0a9-a111-49ee-94df-c5623811b6cc";


const migrateAddColumnAndRefactorShopProfile = async ({ transaction }) => {
    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const currentDateTime = moment();
            const findShopProfiles = await ShopProfile.findAll({
                transaction: transaction,
                order: [['shop_code_id', 'ASC']]
            });
            const shop_code_ids = findShopProfiles.map(w => w.shop_code_id.toLowerCase());
            for (let index = 0; index < shop_code_ids.length; index++) {
                const element_shop_code_id = shop_code_ids[index];
                // if (element_shop_code_id !== '01hq0004') {
                //     continue;
                // }
                const modelShopProduct = ShopProduct(element_shop_code_id);
                const {
                    ShopPersonalCustomer: modelShopPersonalCustomer,
                    ShopBusinessCustomer: modelShopBusinessCustomers,
                    ShopVehicleCustomer: modelShopVehicleCustomer,
                    ShopServiceOrderDoc: modelShopServiceOrderDoc,
                    ShopServiceOrderList: modelShopServiceOrderList,
                    ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderList,
                    ShopTaxInvoiceDoc,
                    ShopTaxInvoiceList,
                    ShopPaymentTransaction
                } = initShopModel(element_shop_code_id);

                await modelShopServiceOrderDoc.sync({
                    force: true,
                    transaction: transaction
                });
                await modelShopServiceOrderList.sync({
                    force: true,
                    transaction: transaction
                });
                await ShopTemporaryDeliveryOrderDoc.sync({
                    force: true,
                    transaction: transaction
                });
                await ShopTemporaryDeliveryOrderList.sync({
                    force: true,
                    transaction: transaction
                });
                await ShopTaxInvoiceDoc.sync({
                    force: true,
                    transaction: transaction
                });
                await ShopTaxInvoiceList.sync({
                    force: true,
                    transaction: transaction
                });
                await ShopPaymentTransaction.sync({
                    force: true,
                    transaction: transaction
                });

                const runTest = async () => {
                    const createDocument_ShopPersonalCustomer_ShopVehicleCustomer = async () => {
                        const findShopPersonalCustomer = await modelShopPersonalCustomer.findOne({
                            include: [
                                {
                                    model: modelShopVehicleCustomer,
                                    required: true
                                }
                            ],
                            transaction: transaction
                        });
                        return await modelShopServiceOrderDoc.create(
                            {
                                shop_id: findShopProfiles[index].get('id'),
                                doc_type_id: documentType["SalesOrder"],
                                doc_date: currentDateTime,
                                doc_sales_type: 1,
                                per_customer_id: findShopPersonalCustomer?.id || null,
                                vehicle_customer_id: findShopPersonalCustomer?.ShopVehicleCustomers?.[0]?.id || null,
                                tax_type_id: documentVatTypeId["IncludedVat"],
                                vat_type: documentVatType["IncludedVat"],
                                vat_rate: vatTypeRate["IncludedVat"],
                                price_discount_bill: 0,
                                price_discount_before_pay: 0,
                                price_sub_total: 0,
                                price_discount_total: 0,
                                price_amount_total: 0,
                                price_before_vat: 0,
                                price_vat: 0,
                                price_grand_total: 0,
                                created_by: superAdminUserId
                            },
                            {
                                transaction: transaction
                            }
                        );
                    };

                    const createDocument_ShopBusinessCustomers_ShopVehicleCustomer = async () => {
                        const findShopBusinessCustomers = await modelShopBusinessCustomers.findOne({
                            include: [
                                {
                                    model: modelShopVehicleCustomer,
                                    required: true
                                }
                            ],
                            transaction: transaction
                        });
                        return await modelShopServiceOrderDoc.create(
                            {
                                shop_id: findShopProfiles[index].get('id'),
                                doc_type_id: documentType["SalesOrder"],
                                doc_date: currentDateTime,
                                doc_sales_type: 1,
                                bus_customer_id: findShopBusinessCustomers?.id || null,
                                vehicle_customer_id: findShopBusinessCustomers?.ShopVehicleCustomers?.[0]?.id || null,
                                tax_type_id: documentVatTypeId["IncludedVat"],
                                vat_type: documentVatType["IncludedVat"],
                                vat_rate: vatTypeRate["IncludedVat"],
                                price_discount_bill: 0,
                                price_discount_before_pay: 0,
                                price_sub_total: 0,
                                price_discount_total: 0,
                                price_amount_total: 0,
                                price_before_vat: 0,
                                price_vat: 0,
                                price_grand_total: 0,
                                created_by: superAdminUserId
                            },
                            {
                                transaction: transaction
                            }
                        );
                    };

                    // This function will error, due to not allow column/attribute 'bus_customer_id' and 'per_customer_id' have both UUID in same document
                    const createDocument_ShopPersonalCustomer_ShopBusinessCustomers_ShopVehicleCustomer = async () => {
                        const findShopPersonalCustomer = await modelShopPersonalCustomer.findOne({
                            include: [
                                {
                                    model: modelShopVehicleCustomer,
                                    required: true
                                }
                            ],
                            transaction: transaction
                        });
                        const findShopBusinessCustomers = await modelShopBusinessCustomers.findOne({
                            include: [
                                {
                                    model: modelShopVehicleCustomer,
                                    required: true
                                }
                            ],
                            transaction: transaction
                        });
                        return await modelShopServiceOrderDoc.create(
                            {
                                shop_id: findShopProfiles[index].get('id'),
                                doc_type_id: documentType["SalesOrder"],
                                doc_date: currentDateTime,
                                doc_sales_type: 1,
                                per_customer_id: findShopPersonalCustomer?.id || null,
                                bus_customer_id: findShopBusinessCustomers?.id || null,
                                vehicle_customer_id: findShopPersonalCustomer?.ShopVehicleCustomers?.[0]?.id || null,
                                tax_type_id: documentVatTypeId["IncludedVat"],
                                vat_type: documentVatType["IncludedVat"],
                                vat_rate: vatTypeRate["IncludedVat"],
                                price_discount_bill: 0,
                                price_discount_before_pay: 0,
                                price_sub_total: 0,
                                price_discount_total: 0,
                                price_amount_total: 0,
                                price_before_vat: 0,
                                price_vat: 0,
                                price_grand_total: 0,
                                created_by: superAdminUserId
                            },
                            {
                                transaction: transaction
                            }
                        );
                    };

                    const createDocument_ShopServiceOrderList = async () => {
                        const HeaderDoc = await createDocument_ShopPersonalCustomer_ShopVehicleCustomer();
                        const findProduct = await utilGetShopStockDataBalance(
                            element_shop_code_id,
                            {
                                balance: '> 0',
                                transaction: transaction
                            }
                        );
                        const productStockWithDot_Index = findProduct.findIndex(w => w.dot_mfd);
                        const beforeDataStock = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });
                        const ListDoc = await modelShopServiceOrderList.create(
                            {
                                shop_service_order_doc_id: HeaderDoc.get('id'),
                                shop_id: HeaderDoc.get('shop_id'),
                                seq_number: 1,
                                shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                                shop_stock_id: findProduct[productStockWithDot_Index].shop_stock_id,
                                shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                                shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                                purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                                dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                                cost_unit: 0,
                                amount: 2,
                                price_unit: 0,
                                price_discount: 0,
                                price_discount_percent: 0,
                                price_grand_total: 0,
                                created_by: superAdminUserId
                            },
                            {
                                transaction: transaction
                            }
                        );
                        const afterDataStock_1 = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });
                        const findCreatedListDoc = await modelShopServiceOrderList.findOne(
                            {
                                where: {
                                    id: ListDoc.get('id'),
                                },
                                transaction: transaction
                            }
                        );

                        findCreatedListDoc.set({
                            seq_number: 2,
                            amount: 8
                        });
                        await findCreatedListDoc.save({
                            transaction: transaction
                        });
                        const afterDataStock_2 = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });

                        findCreatedListDoc.set({
                            status: 1
                        });
                        await findCreatedListDoc.save({
                            transaction: transaction
                        });
                        const afterDataStock_3 = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });

                        findCreatedListDoc.set({
                            status: 1
                        });
                        await findCreatedListDoc.save({
                            transaction: transaction
                        });
                        const afterDataStock_4 = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });

                        HeaderDoc.set({
                            status: 2
                        });
                        await HeaderDoc.save({
                            transaction: transaction
                        });
                        const afterDataStock_5 = await utilGetShopStockDataBalance(element_shop_code_id, {
                            transaction: transaction,
                            shop_product_id: findProduct[productStockWithDot_Index].shop_product_id,
                            shop_warehouse_id: findProduct[productStockWithDot_Index].shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findProduct[productStockWithDot_Index].shop_warehouse_shelf_item_id,
                            purchase_unit_id: findProduct[productStockWithDot_Index].purchase_unit_id,
                            dot_mfd: findProduct[productStockWithDot_Index].dot_mfd,
                        });

                        console.log({
                            beforeDataStock,
                            afterDataStock_1,
                            afterDataStock_2,
                            afterDataStock_3,
                            afterDataStock_4,
                            afterDataStock_5
                        })
                    };

                    for (let i = 0; i < 3; i++) {
                        // await createDocument_ShopPersonalCustomer_ShopVehicleCustomer();
                        // await createDocument_ShopBusinessCustomers_ShopVehicleCustomer();
                        await createDocument_ShopServiceOrderList();
                    }
                };
                // await runTest();
                // throw Error('Test completed !, due to passed test');
            }
        }
    );

    return transactionResults;
};

migrateAddColumnAndRefactorShopProfile({ transaction: null });

module.exports = migrateAddColumnAndRefactorShopProfile;