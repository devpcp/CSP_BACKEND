const config = require('../config');
const db = require("../db");
const { Transaction } = require("sequelize");

const utilReBalanceInventoryImport = async (table_name = '', transactionx = null) => {
    const Users = require("../models/model").User;
    const UsersProfiles = require("../models/model").UsersProfiles;
    const ShopsProfiles = require("../models/model").ShopsProfiles;
    const ShopStock = require("../models/model").ShopStock;
    const ShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;
    const ShopInventory = require("../models/model").ShopInventory;


    const modelShopStock = ShopStock(table_name);
    const modelShopInventoryTransaction = ShopInventoryTransaction(table_name);
    const modelShopInventory = ShopInventory(table_name);

    const utilSetShopStockProductBalance = require("./util.SetShopStockProductBalance");

    const transactionResult = await db.transaction(
        {
            transaction: transactionx,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await modelShopStock.truncate({
                transaction: transaction,
            });

            const ShopInventoryTransactionsLists = await modelShopInventoryTransaction.findAll({
                where: {
                    status: 1
                },
                transaction: transaction
            });

            for (let index = 0; index < ShopInventoryTransactionsLists.length; index++) {
                const element = ShopInventoryTransactionsLists[index];
                const ShopInventoryLists = await modelShopInventory.findAll({
                    where: {
                        doc_inventory_id: element.get('id'),
                        status: 1
                    },
                    transaction: transaction
                });

                for (let idx = 0; idx < ShopInventoryLists.length; idx++) {
                    const ele = ShopInventoryLists[idx];

                    for (let iii = 0; iii < (ele.get('warehouse_detail')).length; iii++) {
                        const eee = (ele.get('warehouse_detail'))[iii];
                        const warehouse_Id = eee.warehouse;
                        const shelfItem_Name = eee.shelf.item;
                        const purchaseUnit_Id = eee.shelf.purchase_unit_id;
                        const dot_Mfd = eee.shelf.dot_mfd || '';
                        const amount = eee.shelf.amount;

                        await utilSetShopStockProductBalance(
                            table_name,
                            ele.get('product_id'),
                            warehouse_Id,
                            shelfItem_Name,
                            purchaseUnit_Id,
                            dot_Mfd,
                            'add_balance_product',
                            amount,
                            {
                                transaction: transaction
                            }
                        );
                    }
                }
            }

            return ShopInventoryTransactionsLists;
        }
    );

    return transactionResult;
};

const serviceReBalanceInventoryImport_AllShop = async () => {
    const Users = require("../models/model").User;
    const UsersProfiles = require("../models/model").UsersProfiles;
    const ShopsProfiles = require("../models/model").ShopsProfiles;

    const transactionResult = await db.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const listShoProfiles = await ShopsProfiles.findAll({ transaction: transaction });
            for (let index = 0; index < listShoProfiles.length; index++) {
                const element = listShoProfiles[index];
                await utilReBalanceInventoryImport(element.shop_code_id.toLowerCase(), transaction);
            }
        }
    )
};

serviceReBalanceInventoryImport_AllShop();