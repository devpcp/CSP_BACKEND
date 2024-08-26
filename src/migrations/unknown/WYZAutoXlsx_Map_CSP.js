// # Tools สำหรับ Map Data ของ WYZAuto กับของ CSP ว่ามีอันไหนตรงกันบ้าง

const config = require("../../config");
const _ = require("lodash")
const path = require("path");
const xlsx = require("xlsx");
const Product = require("../../models/Product/Product");
const { Op } = require("sequelize");

const fnReadWorkSheet = async () => {
    const wb = xlsx.readFile(path.join(__dirname, 'wyz_excel.xlsx'));

    return wb.Sheets[wb.SheetNames[1]];
};

const fnCheckBlankCol = () => {};

const taskToDo = async () => {
    const ws = await fnReadWorkSheet();

    for (let indexColumn = 0; indexColumn < 100; indexColumn++) {
        const colElement = xlsx.utils.encode_cell({r: 0,c: indexColumn});
        if (!ws[colElement]) {
            const fnxx = async () => {
                for (let indexRow = 0; indexRow < 1048575; indexRow++) {
                    const cellElement = xlsx.utils.encode_cell({r: indexRow,c: indexColumn});
                    console.log('cellElement', cellElement)
                    if (!ws[cellElement]) {
                        continue;
                    }
                    else {
                        console.log('checked', colElement, cellElement)
                        return;
                    }
                }
            };

            /**
             * @type {{from: number; to: number;}[]}
             */
            const rangeBox = [];
            while (rangeBox[rangeBox.length].to < 1048575) {

            }

            const [] = await Promise.all()
        }
    }

    return;

    const colA = xlsx.utils.sheet_to_json(ws);

    /**
     *
     * @type {{WYZ_SKU: string; CSP_ProductId: string; isFoundBy: "WYZ_SKU" || "Full_Description"}[]}
     */
    const results = [];
    for (let index = 0; index < colA.length; index++) {
        const element = colA[index];
        const WYZ_SKU = _.get(element, 'WYZ SKU', '').toString();
        const Full_Description = _.get(element, 'Full description', '').toString();
        const findProduct_SKU = await Product.findAll({
            where: {
                master_path_code_id: WYZ_SKU
            }
        });
        if (findProduct_SKU.length !== 1) {
            const findProduct_FullDesc = await Product.findAll({
                where: {
                    [Op.or]: [
                        {
                            product_name: {
                                th: Full_Description
                            }
                        },
                        {
                            product_name: {
                                en: Full_Description
                            }
                        }
                    ]
                }
            });

            if (findProduct_FullDesc.length !== 1) {
                // console.log(`❌ | WYZ_SKU: "${WYZ_SKU}" | NotFound`);
                continue;
            }
            else {
                results.push({
                    WYZ_SKU: WYZ_SKU,
                    CSP_ProductId: findProduct_SKU[0].get('id'),
                    isFoundBy: "Full_Description"
                });
            }
        }
        else {
            results.push({
                WYZ_SKU: WYZ_SKU,
                CSP_ProductId: findProduct_SKU[0].get('id'),
                isFoundBy: "WYZ_SKU"
            });
        }
    }

    return results;
};

taskToDo().then(r => console.log(r));