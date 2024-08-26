const { Op } = require("sequelize");
const { similar } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const XLSX = require('xlsx');
const fs = require('fs');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

const Dealers = require('../models/model').Dealers;
const Customer = require('../models/model').Customer;
const BusinessType = require('../models/model').BusinessType;
const MatchCustomerDealer = require('../models/model').MatchCustomerDealer;

const handleAddJson = async (request, res) => {

    try {

        const rdcode = request.query.rdcode

        const data_json = request.body

        var create_err = []
        var check_rdcode = await Dealers.findAll({
            where: { master_dealer_code_id: { [Op.like]: '%' + rdcode } }
        })

        if (!check_rdcode[0]) {
            return ({ status: 'failed', data: 'rdcode not found in dealer' })
        }

        var run_no = await MatchCustomerDealer.max('run_no') || 0;
        var run_no1 = await Customer.max('run_no') || 0


        await new Promise(async (resolve, reject) => {
            await data_json.forEach(async (element, index, array) => {

                if (element.ผู้เกี่ยวข้อง != null) {
                    // element.ผู้เกี่ยวข้อง
                    var check_customer
                    if (element.hasOwnProperty("ADCode")) {
                        check_customer = await Customer.findAll({
                            where: {
                                [Op.or]: [
                                    { master_customer_code_id: element.ADCode.toString() },
                                ]
                            }
                        })
                    } else if (element.ผู้เกี่ยวข้อง == null || check_customer.length == 0) {
                        check_customer = await Customer.findAll({
                            where: {
                                customer_name: {
                                    th: { [Op.like]: '%' + element.ผู้เกี่ยวข้อง + '%' }
                                }
                            }
                        })

                    }

                    if (check_customer.length == 0) {
                        var customer_all = await Customer.findAll({})
                        await new Promise(async (resolve, reject) => {
                            await customer_all.forEach(async (element1, index1, array1) => {
                                if (similar(element.ผู้เกี่ยวข้อง, element1.customer_name.th) > 74) {
                                    check_customer.push(element1)
                                }
                                if (index1 === array1.length - 1) resolve();
                            })
                        })
                    }

                    var business = []
                    if (element.ประเภทธุรกิจ != null) {
                        business = await BusinessType.findAll({
                            where: {
                                business_type_name: {
                                    th: { [Op.like]: '%' + element.ประเภทธุรกิจ + '%' }
                                }
                            }
                        })
                    }


                    var tel = {}
                    var customer_id = ''
                    if (element.ติดต่อ != null) {
                        [tel_no_1, tel_no_2, tel_no_3, tel_no_4, tel_no_5, tel_no_6] = element.ติดต่อ.toString().split(",");
                        tel = { tel_no_1, tel_no_2, tel_no_3, tel_no_4, tel_no_5, tel_no_6 };
                    }

                    if (check_customer.length > 0) {
                        await Customer.update({
                            bus_type_id: (business.length > 0) ? business[0].id : null,
                            dealer_customer_code_id: (element.เลขประจำตัว.toString() != null) ? element.เลขประจำตัว.toString() : null,
                            tel_no: tel,
                            // master_customer_code_id: (element.ADCode.toString() != null) ? element.ADCode.toString() : null,
                            updated_by: request.id,
                            updated_date: new Date()

                        }, {
                            where: {
                                id: check_customer[0].id
                            }
                        }).then(function (item) {
                        }).catch(function (err) {
                            console.log(err)
                            create_err.push(["index " + index + " error :" + err.errors[0].message])
                        });

                        customer_id = check_customer[0].id
                    }
                    else {

                        // var check_uniq = []

                        // if (element.ADCode.toString() != null || element.เลขประจำตัว.toString() != null) {
                        //     check_uniq = await Customer.findAll({
                        //         where: {
                        //             [Op.or]: [{ master_customer_code_id: element.ADCode.toString() }, { dealer_customer_code_id: element.เลขประจำตัว.toString() }]
                        //         }
                        //     })
                        // }

                        // if (check_uniq.length > 0) {
                        //     create_err.push(index)
                        // } else {

                        run_no1 = run_no1 + 1

                        var master_customer_code_id = 82000000 + run_no1

                        await Customer.create({
                            customer_name: { th: element.ผู้เกี่ยวข้อง, en: '' },
                            bus_type_id: (business.length > 0) ? business[0].id : null,
                            dealer_customer_code_id: (element.เลขประจำตัว.toString() != null) ? element.เลขประจำตัว.toString() : null,
                            tel_no: tel,
                            master_customer_code_id: master_customer_code_id,
                            isuse: 1,
                            run_no: run_no1,
                            created_by: request.id,
                            created_date: new Date()
                        }).then(function (item) {
                            customer_id = item.id
                        }).catch(function (err) {
                            console.log(err)
                            create_err.push(["index " + index + " error :" + err.errors[0].message])
                        });


                        // }



                    }

                    if (customer_id != '') {
                        var match = []
                        await MatchCustomerDealer.findAll({
                            where: {
                                [Op.and]: [{ dealer_id: check_rdcode[0].id }, { customer_id: customer_id }]
                            }
                        }).then(function (item) {
                            match = item
                        }).catch(function (err) {
                            // console.log(err)
                        });

                        if (match.length == 0) {
                            // run_no = await MatchCustomerDealer.max('run_no', { where: { dealer_id: check_rdcode[0].id } }) || 0;

                            run_no = run_no + 1
                            await MatchCustomerDealer.create({
                                dealer_id: check_rdcode[0].id,
                                customer_id: customer_id,
                                run_no: run_no,
                                created_by: request.id,
                                // created_date: new Date()
                            }).then(function (item) {
                                // res.json({
                                //   "Message" : "Created item.",
                                //   "Item" : item
                                // });
                            }).catch(function (err) {
                                console.log(err)

                            });
                        }
                    }


                }

                if (index === array.length - 1) resolve();
            });
        });

        var err_str = ''
        if (create_err.length > 0) {
            err_str = ' but index ' + create_err.toString() + ' have something uniqe '
        }


        await handleSaveLog(request, [['Match customer to dealer by json'], err_str])
        return ({ status: "successful", data: "success" + err_str })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['Match customer to dealer by json'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }


}




const handleAddFile = async (request, res) => {

    try {
        const data = await request.file()

        await pump(data.file, fs.createWriteStream('src/assets/customer/' + data.filename))
        const wb = XLSX.readFile('src/assets/customer/' + data.filename);
        await fs.unlinkSync('src/assets/customer/' + data.filename)



        const rdcode = Object.keys(await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])[0])[1]

        const data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 1 })

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 1 })[0]

        var create_err = []

        if (!(header[0] == 'ADCode' && header[1] == 'ผู้เกี่ยวข้อง' && header[2] == 'ประเภทธุรกิจ' && header[3] == 'เลขประจำตัว' && header[4] == 'ติดต่อ')) {
            return ({ status: 'failed', data: 'header incorrect' })
        }

        var check_rdcode = await Dealers.findAll({
            where: { master_dealer_code_id: { [Op.like]: '%' + rdcode } }
        })

        if (!check_rdcode[0]) {
            return ({ status: 'failed', data: 'rdcode not found in dealer' })
        }

        var run_no = await MatchCustomerDealer.max('run_no') || 0;
        var run_no1 = await Customer.max('run_no') || 0

        await new Promise(async (resolve, reject) => {
            await data_json.forEach(async (element, index, array) => {

                if (element.hasOwnProperty("ผู้เกี่ยวข้อง")) {
                    // element.ผู้เกี่ยวข้อง
                    var check_customer
                    if (element.hasOwnProperty("ADCode")) {
                        check_customer = await Customer.findAll({
                            where: {
                                [Op.or]: [
                                    { master_customer_code_id: element.ADCode.toString() },
                                ]
                            }
                        })
                    } else if (element.hasOwnProperty("ADCode") === false || check_customer.length == 0) {
                        check_customer = await Customer.findAll({
                            where: {
                                customer_name: {
                                    th: { [Op.like]: '%' + element.ผู้เกี่ยวข้อง + '%' }
                                }
                            }
                        })

                    }

                    if (check_customer.length == 0) {
                        var customer_all = await Customer.findAll({})
                        await new Promise(async (resolve, reject) => {
                            await customer_all.forEach(async (element1, index1, array1) => {
                                if (similar(element.ผู้เกี่ยวข้อง, element1.customer_name.th) > 74) {
                                    check_customer.push(element1)
                                }
                                if (index1 === array1.length - 1) resolve();
                            })
                        })
                    }

                    var business = []
                    if (element.hasOwnProperty("ประเภทธุรกิจ")) {
                        business = await BusinessType.findAll({
                            where: {
                                business_type_name: {
                                    th: { [Op.like]: '%' + element.ประเภทธุรกิจ + '%' }
                                }
                            }
                        })
                    }


                    var tel = {}
                    var customer_id = ''
                    if (element.hasOwnProperty("ติดต่อ")) {
                        [tel_no_1, tel_no_2, tel_no_3, tel_no_4, tel_no_5, tel_no_6] = element.ติดต่อ.toString().split(",");
                        tel = { tel_no_1, tel_no_2, tel_no_3, tel_no_4, tel_no_5, tel_no_6 };
                    }

                    var check_uniq = []
                    // if (element.hasOwnProperty("ADCode")) {

                    //     await Customer.findAll({
                    //         where: {
                    //             [Op.or]: [{ master_customer_code_id: element.ADCode.toString() }]
                    //         }
                    //     }).then(function (item) {
                    //         check_uniq.push(item)
                    //     }).catch(function (err) {
                    //         console.log(err)
                    //     });

                    // }
                    // if (element.hasOwnProperty("เลขประจำตัว")) {

                    //     await Customer.findAll({
                    //         where: {
                    //             [Op.or]: [
                    //                 { dealer_customer_code_id: element.เลขประจำตัว.toString() }]
                    //         }
                    //     }).then(function (item) {
                    //         check_uniq.push(item)
                    //     }).catch(function (err) {
                    //         console.log(err)
                    //     });

                    // }

                    // if (check_uniq.length > 0) {
                    //     create_err.push(index)
                    // } else {

                    // }

                    if (check_customer.length > 0) {
                        await Customer.update({
                            bus_type_id: (business.length > 0) ? business[0].id : null,
                            dealer_customer_code_id: (element.hasOwnProperty("เลขประจำตัว")) ? element.เลขประจำตัว.toString() : null,
                            tel_no: tel,
                            // master_customer_code_id: (element.hasOwnProperty("ADCode")) ? element.ADCode.toString() : null,

                        }, {
                            where: {
                                id: check_customer[0].id
                            }
                        }).then(function (item) {
                            customer_id = item.id
                        }).catch(function (err) {
                            // console.log(err.errors[0].message)
                            create_err.push(["index " + index + " error :" + err.errors[0].message])
                        });

                        // customer_id = check_customer[0].id
                    }
                    else {

                        run_no1 = run_no1 + 1

                        var master_customer_code_id = 82000000 + run_no1

                        await Customer.create({
                            customer_name: { th: element.ผู้เกี่ยวข้อง, en: '' },
                            bus_type_id: (business.length > 0) ? business[0].id : null,
                            dealer_customer_code_id: (element.hasOwnProperty("เลขประจำตัว")) ? element.เลขประจำตัว.toString() : null,
                            tel_no: tel,
                            master_customer_code_id: master_customer_code_id,
                            isuse: 1,
                            run_no: run_no1,
                            created_by: request.id,
                            created_date: new Date()
                        }).then(function (item) {
                            customer_id = item.id
                        }).catch(function (err) {
                            // console.log(err)
                            create_err.push(["index " + index + " error :" + err.errors[0].message])

                        });


                    }

                    if (customer_id != '') {
                        var match = []
                        await MatchCustomerDealer.findAll({
                            where: {
                                [Op.and]: [{ dealer_id: check_rdcode[0].id }, { customer_id: customer_id }]
                            }
                        }).then(function (item) {
                            match = item
                        }).catch(function (err) {
                            // console.log(err)
                        });

                        if (match.length == 0) {
                            // run_no = await MatchCustomerDealer.max('run_no', { where: { dealer_id: check_rdcode[0].id } }) || 0;

                            run_no = run_no + 1
                            await MatchCustomerDealer.create({
                                dealer_id: check_rdcode[0].id,
                                customer_id: customer_id,
                                run_no: run_no,
                                created_by: request.id,
                                // created_date: new Date()
                            }).then(function (item) {
                                // res.json({
                                //   "Message" : "Created item.",
                                //   "Item" : item
                                // });
                            }).catch(function (err) {
                                // console.log(err)
                            });
                        }
                    }


                }

                if (index === array.length - 1) resolve();
            });
        });


        var err_str = ''
        if (create_err.length > 0) {
            err_str = ' but ' + create_err.toString()
        }
        await handleSaveLog(request, [['Match customer to dealer by file'], err_str])
        return ({ status: "successful", data: "success" + err_str })



    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['Match customer to dealer by file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

    // new Promise



}


module.exports = {
    handleAddFile,
    handleAddJson
}