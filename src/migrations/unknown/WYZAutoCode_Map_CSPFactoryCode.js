// # Tools สำหรับ Map Data ของ WYZAuto กับของ CSP ในส่วนของ WYZCode

const config = require("../../config");
const _ = require("lodash")
const path = require("path");
const xlsx = require("xlsx");
const sequelize = require("../../db")
const Product = require("../../models/Product/Product");
const { Transaction } = require("sequelize");

const fnReadWorkSheet = async () => {
    const wb = xlsx.readFile(path.join(__dirname, 'wyz_csp_product_map_wyzcode.xlsx'));

    return wb.Sheets[wb.SheetNames[0]];
};

const taskToDo = async () => {
    const ws = await fnReadWorkSheet();

    const colA = xlsx.utils.sheet_to_json(ws);


    const transactionResult = await sequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            /**
             *
             * @type {{ProductFactoryCode: string; WYZCode: string; description: string;}[]}
             */
            const results = [];
            for (let index = 0; index < colA.length; index++) {
                const element = colA[index];
                const ProductBrand = _.get(element, '__EMPTY_5', '');
                if (ProductBrand === 'MICHELIN') {
                    const WYZCode = _.get(element, '__EMPTY_1', '');
                    if (WYZCode && WYZCode !== '#N/A') {
                        const ProductFactoryCode = _.get(element, '__EMPTY', '');
                        if (ProductFactoryCode && WYZCode && ProductBrand) {
                            const findProduct = await Product.findAll({
                                where: {
                                    master_path_code_id: ProductFactoryCode
                                },
                                transaction: transaction
                            });
                            if (findProduct.length === 1) {
                                const updateProductWYZCode = await Product.update(
                                    {
                                        wyz_code: WYZCode,
                                    },
                                    {
                                        where: {
                                            id: findProduct[0].get('id')
                                        },
                                        transaction: transaction
                                    }
                                );
                            }
                            if (findProduct.length > 1) {
                                results.push({
                                    ProductFactoryCode: ProductFactoryCode,
                                    WYZCode: WYZCode,
                                    description: `findProduct returns length more than 1 (${findProduct.length})`
                                });
                            }
                            if (findProduct.length <= 0) {
                                results.push({
                                    ProductFactoryCode: ProductFactoryCode,
                                    WYZCode: WYZCode,
                                    description: `findProduct returns not found`
                                });
                            }
                        }
                    }
                }
            }
            return results;
        }
    );

    return transactionResult;
};

taskToDo().then(r => console.log(r));