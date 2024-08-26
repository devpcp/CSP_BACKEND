const _ = require("lodash");
const { isPlainObject } = require("lodash");
const { Op, Transaction } = require("sequelize");
const config = require('../config');
const { AuthJWTError } = require('../errors/auth');
const customError = require('../utils/custom-error');
const { generateHashPassword, isNull, paginate } = require('../utils/generate');
const { handleSaveLog } = require('../handlers/log');
const utilGetModelShopsProfilesNextSeq = require("../utils/util.GetModelShopsProfilesNextSeq");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilNginxCreateConfigSubDomain = require("../utils/util.Nginx.CreateConfigSubDomain");
const utilNginxIsConfigSubDomainExists = require("../utils/util.Nginx.IsConfigSubDomainExists");
const utilConvertStringToNumberMilliseconds = require("../utils/util.ConvertStringToNumberMilliseconds");
const utilNginxIsFormatSubDomainNameValid = require("../utils/util.Nginx.IsFormatSubDomainNameValid");
const utilNginxCommandTestConfig = require("../utils/util.Nginx.Command.TestConfig");
const utilNginxCommandReload = require("../utils/util.Nginx.Command.Reload");

const sequelize = require('../db');
const User = require('../models/model').User;
const Group = require('../models/model').Group;
const MapUserGroup = require('../models/model').MapUserGroup;
const Application = require('../models/model').Application;
const Access = require('../models/model').Access;
const Role = require('../models/model').Role;
const Oauth = require('../models/model').Oauth;
const ShopsProfiles = require('../models/model').ShopsProfiles
const UsersProfiles = require('../models/model').UsersProfiles
const modelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;
const modelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;
const modelShopWarehouse = require("../models/model").ShopWarehouse;
const modelShopStock = require("../models/model").ShopStock;
const modelShopInventory = require("../models/model").ShopInventory;
const modelShopProduct = require("../models/model").ShopProduct;
const modelShopProductPriceLog = require("../models/model").ShopProductPriceLog;
const modelShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;
const modelShopSalesTransaction = require("../models/model").ShopSalesTransactionDoc;
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopVehiclesCustomers = require("../models/model").ShopVehicleCustomer;
const modelShopSalesTransactionOut = require("../models/model").ShopSalesTransactionOut;
const modelShopInventoryPurchasingPreOrderDoc = require("../models/model").ShopInventoryPurchasingPreOrderDoc;
const modelShopInventoryPurchasingPreOrderProductList = require("../models/model").ShopInventoryPurchasingPreOrderProductList;
const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto;
const modelShopInventoryMovementLogs = require("../models/model").ShopInventoryMovementLog;
const modelShopPurchaseOrderDoc = require("../models/model").ShopPurchaseOrderDoc;
const modelShopPurchaseOrderList = require("../models/model").ShopPurchaseOrderList;
const modelShopQuotationDoc = require("../models/model").ShopQuotationDoc;
const modelShopQuotationList = require("../models/model").ShopQuotationList;
const modelShopLegacySalesOut = require("../models/model").ShopLegacySalesOut;
const modelShopDocumentCode = require("../models/model").ShopDocumentCode;
const modelShopServiceOrderDoc = require("../models/model").ShopServiceOrderDoc;
const modelShopServiceOrderList = require("../models/model").ShopServiceOrderList;
const modelShopTemporaryDeliveryOrderDoc = require("../models/model").ShopTemporaryDeliveryOrderDoc;
const modelShopTemporaryDeliveryOrderList = require("../models/model").ShopTemporaryDeliveryOrderList;
const modelShopTaxInvoiceDoc = require("../models/model").ShopTaxInvoiceDoc;
const modelShopTaxInvoiceList = require("../models/model").ShopTaxInvoiceList;
const modelShopCustomerDebtDebitNoteDoc = require("../models/model").ShopCustomerDebtDebitNoteDoc;
const modelShopCustomerDebtDebitNoteList = require("../models/model").ShopCustomerDebtDebitNoteList;
const modelShopCustomerDebtCreditNoteDoc = require("../models/model").ShopCustomerDebtCreditNoteDoc;
const modelShopCustomerDebtCreditNoteList = require("../models/model").ShopCustomerDebtCreditNoteList;
const modelShopCustomerDebtBillingNoteDoc = require("../models/model").ShopCustomerDebtBillingNoteDoc;
const modelShopCustomerDebtBillingNoteList = require("../models/model").ShopCustomerDebtBillingNoteList;
const modelShopCustomerDebtDoc = require("../models/model").ShopCustomerDebtDoc;
const modelShopCustomerDebtList = require("../models/model").ShopCustomerDebtList;
const modelShopPartnerDebtDebitNoteDoc = require("../models/model").ShopPartnerDebtDebitNoteDoc;
const modelShopPartnerDebtDebitNoteList = require("../models/model").ShopPartnerDebtDebitNoteList;
const modelShopPartnerDebtCreditNoteDoc = require("../models/model").ShopPartnerDebtCreditNoteDoc;
const modelShopPartnerDebtCreditNoteList = require("../models/model").ShopPartnerDebtCreditNoteList;
const modelShopPaymentTransaction = require("../models/model").ShopPaymentTransaction;
const modelShopBank = require("../models/model").ShopBank;
const modelShopCheckCustomer = require("../models/model").ShopCheckCustomer;
const modelShopAppointment = require("../models/model").ShopAppointment;
const modelShopPartnerDebtDoc = require("../models/model").ShopPartnerDebtDoc;
const modelShopPartnerDebtList = require("../models/model").ShopPartnerDebtList;
const modelShopPartnerDebtBillingNoteDoc = require("../models/model").ShopPartnerDebtBillingNoteDoc;
const modelShopPartnerDebtBillingNoteList = require("../models/model").ShopPartnerDebtBillingNoteList;





const handleUserMe = async (request) => {
    // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'

    if (!request.id) {
        return customError(AuthJWTError.Unauthorized)
    }

    var user = await User.findAll({
        where: { id: request.id },
        include: [
            {
                model: UsersProfiles,
                include: [
                    { model: ShopsProfiles }
                ]
            },
            { model: Group, attributes: ['id', 'group_name'], through: { attributes: [] } },
            { model: Oauth }
        ]
    });
    user = user[0];

    var access_array = [];
    if (user.Groups.length > 0) {
        await new Promise(async (resolve) => {
            await user.Groups.forEach(async (element, index, array) => {
                await Access.findAll({
                    attributes: ['id', 'access_name'],
                    where: {
                        rules: { [Op.contains]: [element.id] }
                    }

                })
                    .then(async function (item) {
                        await new Promise(async (resolve1) => {
                            item.forEach(async (element1, index1, array1) => {
                                access_array.push(element1.id)
                                if (index1 === array1.length - 1) resolve1();
                            })

                        })

                        // access_array.push(item.map((el) => { return el.id }))
                        // access_array.push(item)
                    })

                if (index === array.length - 1) resolve();
            });
        })
    } else {
        var access_array = [config.publish_access_id] //publish id of acsss
        var group_id_guest = config.quest_group_id //user id of guest
    }
    access_array = [...new Set(access_array)];

    var isuse = true;
    var sort = 'sort_order';
    var order = 'asc';

    var application = await Application.findAll({
        include: [
            {
                model: Access, attributes: ['id', 'access_name']
            }, {
                model: Application,
                as: 'children',
                where: [{ use_menu: isuse }, { access: access_array }],
                attributes: ['id', 'application_name', 'url', 'func_status', 'application_config', 'sort_order',
                    ['use_menu', 'create'], ['use_menu', 'read'], ['use_menu', 'update'], ['use_menu', 'delete']],
                // order: [['children', sort, order]],
                required: false,
                include: [{
                    model: Access, attributes: ['id', 'access_name']
                }, {
                    model: Application,
                    as: 'children',
                    where: [{ use_menu: isuse }, { access: access_array }],
                    attributes: ['id', 'application_name', 'url', 'func_status', 'application_config', 'sort_order',
                        ['use_menu', 'create'], ['use_menu', 'read'], ['use_menu', 'update'], ['use_menu', 'delete']],
                    // order: [['children', sort, order]],
                    required: false,
                    include: [{
                        model: Access, attributes: ['id', 'access_name']
                    }, {
                        model: Application,
                        as: 'children',
                        where: [{ use_menu: isuse }, { access: access_array }],
                        attributes: ['id', 'application_name', 'url', 'func_status', 'application_config', 'sort_order',
                            ['use_menu', 'create'], ['use_menu', 'read'], ['use_menu', 'update'], ['use_menu', 'delete']],
                        // order: [['children', sort, order]],
                        required: false,
                    }]
                }]

            }],
        attributes: ['id', 'application_name', 'url', 'func_status', 'application_config', 'sort_order',
            ['use_menu', 'create'], ['use_menu', 'read'], ['use_menu', 'update'], ['use_menu', 'delete']
        ],
        // order: '"children"."sort_order" DESC',
        order: [['children', sort, order]],
        required: false,
        where: {
            [Op.and]: [{ use_menu: isuse }, { parent_menu: null }, { access: access_array }],
        },
    })
    application.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : ((b.sort_order > a.sort_order) ? -1 : 0))

    var Permission = [];
    var group_id_all = await user.Groups.map((el) => { return el.id });
    for (let [index, element] of application.entries()) {
        var role = await Role.findAll({
            where: [{ group_id: (user.Groups.length > 0) ? group_id_all : group_id_guest },
            { application_id: element.id }]
        })

        if (role[0]) {
            // update = role[0].update
            application[index].dataValues.create = role[0].create
            application[index].dataValues.read = role[0].read
            application[index].dataValues.update = role[0].update_
            application[index].dataValues.delete = role[0].delete

            if (Permission.filter(e => e.id === application[index].id).length == 0) {
                Permission.push({
                    id: application[index]['id'],
                    application_name: application[index]['application_name'],
                    url: application[index]['url'],
                    func_status: application[index]['func_status'],
                    application_config: application[index]['application_config'],
                    sort_order: application[index]['sort_order'],
                    create: application[index].dataValues.create,
                    read: application[index].dataValues.read,
                    update: application[index].dataValues.update,
                    delete: application[index].dataValues.delete,
                    Access: application[index]['Access'],

                })
            }

        } else {
            application[index].dataValues.create = 0
            application[index].dataValues.read = 1
            application[index].dataValues.update = 0
            application[index].dataValues.delete = 0
            if (Permission.filter(e => e.id === application[index].id).length == 0) {
                Permission.push({
                    id: application[index]['id'],
                    application_name: application[index]['application_name'],
                    url: application[index]['url'],
                    func_status: application[index]['func_status'],
                    application_config: application[index]['application_config'],
                    sort_order: application[index]['sort_order'],
                    create: 0,
                    read: 1,
                    update: 0,
                    delete: 0,
                    Access: application[index]['Access'],

                })
            }

        }
        if (element.children.length > 0) {

            // await new Promise(async (resolve1, reject) => {
            //     await element.children.forEach(async (element1, index1, array1) => {
            for (let [index1, element1] of element.children.entries()) {

                var role1 = await Role.findAll({
                    where: [{ group_id: (user.Groups.length > 0) ? group_id_all : group_id_guest },
                    { application_id: element1.id }]
                })

                if (role1[0]) {
                    // update = role[0].update
                    application[index].dataValues.children[index1].dataValues.create = role1[0].create
                    application[index].dataValues.children[index1].dataValues.read = role1[0].read
                    application[index].dataValues.children[index1].dataValues.update = role1[0].update_
                    application[index].dataValues.children[index1].dataValues.delete = role1[0].delete

                    if (Permission.filter(e => e.id === application[index].dataValues.children[index1].id).length == 0) {
                        Permission.push({
                            id: application[index].dataValues.children[index1]['id'],
                            application_name: application[index].dataValues.children[index1]['application_name'],
                            url: application[index].dataValues.children[index1]['url'],
                            func_status: application[index].dataValues.children[index1]['func_status'],
                            application_config: application[index].dataValues.children[index1]['application_config'],
                            sort_order: application[index].dataValues.children[index1]['sort_order'],
                            create: application[index].dataValues.children[index1].dataValues.create,
                            read: application[index].dataValues.children[index1].dataValues.read,
                            update: application[index].dataValues.children[index1].dataValues.update,
                            delete: application[index].dataValues.children[index1].dataValues.delete,
                            Access: application[index].dataValues.children[index1]['Access'],

                        })
                    }


                } else {
                    application[index].dataValues.children[index1].dataValues.create = 0
                    application[index].dataValues.children[index1].dataValues.read = 1
                    application[index].dataValues.children[index1].dataValues.update = 0
                    application[index].dataValues.children[index1].dataValues.delete = 0

                    if (Permission.filter(e => e.id === application[index].dataValues.children[index1].id).length == 0) {
                        Permission.push({
                            id: application[index].dataValues.children[index1]['id'],
                            application_name: application[index].dataValues.children[index1]['application_name'],
                            url: application[index].dataValues.children[index1]['url'],
                            func_status: application[index].dataValues.children[index1]['func_status'],
                            application_config: application[index].dataValues.children[index1]['application_config'],
                            sort_order: application[index].dataValues.children[index1]['sort_order'],
                            create: 0,
                            read: 1,
                            update: 0,
                            delete: 0,
                            Access: application[index].dataValues.children[index1]['Access'],

                        })
                    }
                }
                if (element1.children.length > 0) {

                    // await new Promise(async (resolve2, reject) => {
                    //     await element1.children.forEach(async (element2, index2, array2) => {
                    for (let [index2, element2] of element1.children.entries()) {

                        var role2 = await Role.findAll({
                            where: [{ group_id: (user.Groups.length > 0) ? group_id_all : group_id_guest },
                            { application_id: element2.id }]
                        })

                        if (role2[0]) {
                            // update = role[0].update
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.create = role2[0].create
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.read = role2[0].read
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.update = role2[0].update_
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.delete = role2[0].delete

                            if (Permission.filter(e => e.id === application[index].dataValues.children[index1].dataValues.children[index2].id).length == 0) {
                                Permission.push({
                                    id: application[index].dataValues.children[index1].dataValues.children[index2]['id'],
                                    application_name: application[index].dataValues.children[index1].dataValues.children[index2]['application_name'],
                                    url: application[index].dataValues.children[index1].dataValues.children[index2]['url'],
                                    func_status: application[index].dataValues.children[index1].dataValues.children[index2]['func_status'],
                                    application_config: application[index].dataValues.children[index1].dataValues.children[index2]['application_config'],
                                    sort_order: application[index].dataValues.children[index1].dataValues.children[index2]['sort_order'],
                                    create: application[index].dataValues.children[index1].dataValues.children[index2].dataValues.create,
                                    read: application[index].dataValues.children[index1].dataValues.children[index2].dataValues.read,
                                    update: application[index].dataValues.children[index1].dataValues.children[index2].dataValues.update,
                                    delete: application[index].dataValues.children[index1].dataValues.children[index2].dataValues.delete,
                                    Access: application[index].dataValues.children[index1].dataValues.children[index2]['Access'],

                                })
                            }
                        } else {
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.create = 0
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.read = 1
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.update = 0
                            application[index].dataValues.children[index1].dataValues.children[index2].dataValues.delete = 0

                            if (Permission.filter(e => e.id === application[index].dataValues.children[index1].dataValues.children[index2].id).length == 0) {
                                Permission.push({
                                    id: application[index].dataValues.children[index1].dataValues.children[index2]['id'],
                                    application_name: application[index].dataValues.children[index1].dataValues.children[index2]['application_name'],
                                    url: application[index].dataValues.children[index1].dataValues.children[index2]['url'],
                                    func_status: application[index].dataValues.children[index1].dataValues.children[index2]['func_status'],
                                    application_config: application[index].dataValues.children[index1].dataValues.children[index2]['application_config'],
                                    sort_order: application[index].dataValues.children[index1].dataValues.children[index2]['sort_order'],
                                    create: 0,
                                    read: 1,
                                    update: 0,
                                    delete: 0,
                                    Access: application[index].dataValues.children[index1].dataValues.children[index2],

                                })
                            }
                        }

                        // if (index2 === array2.length - 1) resolve2();
                    }
                    // });
                }

                // if (index1 === array1.length - 1) resolve1();
            }
            // });

        }

        // if (index === array.length - 1) resolve();
    }

    user.dataValues.MenuList = application;
    user.dataValues.Permission = Permission;

    await handleSaveLog(request, [['mydata'], '']);
    return ({
        status: 'success',
        data: user
    });
}

const handleUserMe_1 = async (request) => {

    // request.id = 'ca280ffd-5c68-4723-a963-26303cdb6f31'

    if (!request.id) {
        return customError(AuthJWTError.Unauthorized)
    }


    var user = await User.findOne({
        where: { id: request.id },
        attributes: {
            exclude: ['token_set', 'password'],
        },
        include: [
            {
                model: UsersProfiles,
                include: [
                    { model: ShopsProfiles }
                ]
            },
            { model: Group, attributes: ['id', 'group_name'], through: { attributes: [] } },
            { model: Oauth }
        ]
    });
    // user = user[0];
    delete user.dataValues.password
    // return user

    var access_array = [];

    if (user.Groups.length > 0) {
        for (let index = 0; index < user.Groups.length; index++) {
            const element = user.Groups[index];
            await Access.findAll({
                attributes: ['id', 'access_name'],
                where: {
                    rules: { [Op.contains]: [element.id] }
                }

            }).then(async function (item) {
                for (let index = 0; index < item.length; index++) {
                    const element1 = item[index];
                    access_array.push(element1.id)

                }

            })

        }

    } else {
        var access_array = [config.publish_access_id] //publish id of acsss
        var group_id_guest = config.quest_group_id //user id of guest
    }

    const isuse = 1;
    const use_menu = true;
    var sort = 'sort_order';
    var order = 'asc';

    var group_id_all = await user.Groups.map((el) => { return "'" + el.id + "'" })
    if (group_id_all.length == 0) {
        group_id_all = ["'" + group_id_guest + "'"];
    }

    var attributes = (model) => {
        return ['id', 'application_name',
            [sequelize.literal(`(select ap.application_name->>'th' from systems.sysm_application ap where ap.id =  "${model}"."id")`), 'name'],
            [sequelize.literal(`(select ap.application_config->>'description' from systems.sysm_application ap where ap.id =  "${model}"."id")`), 'description'],
            [sequelize.literal(`(select ap.application_config->>'icon' from systems.sysm_application ap where ap.id =  "${model}"."id")`), 'icon'],
            ['url', 'path'],
            'func_status', 'application_config', 'sort_order',
            [sequelize.literal(`(SELECT COALESCE((select ro.create from systems.sysm_role ro where ro.application_id = "${model}"."id"
                and ro.group_id in (${group_id_all}) limit 1), 0))`), 'create'],
            [sequelize.literal(`(SELECT COALESCE((select ro.read from systems.sysm_role ro where ro.application_id =  "${model}"."id"
                and ro.group_id in (${group_id_all}) limit 1), 1))`), 'read'],
            [sequelize.literal(`(SELECT COALESCE((select ro.update from systems.sysm_role ro where ro.application_id = "${model}"."id"  
                and ro.group_id in (${group_id_all}) limit 1), 0))`), 'update'],
            [sequelize.literal(`(SELECT COALESCE((select ro.delete from systems.sysm_role ro where ro.application_id = "${model}"."id"
                and ro.group_id in (${group_id_all}) limit 1), 0))`), 'delete']
        ]
    }



    var application = await Application.findAll({
        where: {
            [Op.and]: [{ use_menu: use_menu }, { isuse: isuse }, { parent_menu: null }, { access: access_array }],
        },
        attributes: attributes("Application"),
        // order: [['sub', sort, order]],
        order: [['sort_order', 'asc'],
        [sequelize.literal(`\"sub\".sort_order asc`)],
        [sequelize.literal(`\"sub->sub\".sort_order asc`)],
        [sequelize.literal(`\"sub->sub->sub\".sort_order asc`)],
        [sequelize.literal(`\"sub->sub->sub->sub\".sort_order asc`)],
        [sequelize.literal(`\"sub->sub->sub->sub->sub\".sort_order asc`)]],
        required: false,
        include: [
            {
                model: Access, attributes: ['id', 'access_name']
            }, {
                model: Application,
                as: 'sub',
                where: [{ use_menu: use_menu }, { isuse: isuse }, { access: access_array }],
                attributes: attributes("sub"),
                required: false,
                include: [{
                    model: Access, attributes: ['id', 'access_name']
                }, {
                    model: Application,
                    as: 'sub',
                    where: [{ use_menu: use_menu }, { isuse: isuse }, { access: access_array }],
                    attributes: attributes("sub->sub"),
                    required: false,
                    include: [{
                        model: Access, attributes: ['id', 'access_name']
                    }, {
                        model: Application,
                        as: 'sub',
                        where: [{ use_menu: use_menu }, { isuse: isuse }, { access: access_array }],
                        attributes: attributes("sub->sub->sub"),
                        required: false,
                        include: [
                            {
                                model: Access, attributes: ['id', 'access_name']
                            }, {
                                model: Application,
                                as: 'sub',
                                where: [{ use_menu: use_menu }, { isuse: isuse }, { access: access_array }],
                                attributes: attributes("sub->sub->sub->sub"),
                                required: false,
                                include: [{
                                    model: Access, attributes: ['id', 'access_name']
                                }, {
                                    model: Application,
                                    as: 'sub',
                                    where: [{ use_menu: use_menu }, { isuse: isuse }, { access: access_array }],
                                    attributes: attributes("sub->sub->sub->sub->sub"),
                                    required: false
                                }]
                            }
                        ]
                    }]
                }]

            }],
    })
    // application.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : ((b.sort_order > a.sort_order) ? -1 : 0))


    var Permission = [];

    var element_ = (element) => {
        return {
            id: element.dataValues.id,
            application_name: element.dataValues.application_name,
            path: element.dataValues.path,
            func_status: element.dataValues.func_status,
            application_config: element.dataValues.application_config,
            sort_order: element.dataValues.sort_order,
            create: element.dataValues.create,
            read: element.dataValues.read,
            update: element.dataValues.update,
            delete: element.dataValues.delete,
            Access: element.dataValues.Access
        }
    }

    // return application

    for (let index = 0; index < application.length; index++) {
        const element = application[index];
        if (Permission.filter(e => e.id === element.id).length == 0) {
            Permission.push(element_(element))
        }
        if (element.sub.length == 0) {
            element.dataValues.sub = undefined
            element.dataValues.type = 'link'
        }
        if (element.sub.length > 0) {
            element.dataValues.type = 'dropDown'
            element.dataValues.path = undefined
            for (let index1 = 0; index1 < element.sub.length; index1++) {
                const element1 = element.sub[index1];
                if (Permission.filter(e => e.id === element1.id).length == 0) {
                    Permission.push(element_(element1))
                }
                if (element1.sub.length == 0) {
                    element1.dataValues.sub = undefined
                    element1.dataValues.type = 'link'
                }
                if (element1.sub.length > 0) {
                    element1.dataValues.type = 'dropDown'
                    element.dataValues.path = undefined
                    for (let index2 = 0; index2 < element1.sub.length; index2++) {
                        const element2 = element1.sub[index2];
                        if (Permission.filter(e => e.id === element2.id).length == 0) {
                            Permission.push(element_(element2))
                        }
                        if (element2.sub.length == 0) {
                            element2.dataValues.sub = undefined
                            element2.dataValues.type = 'link'
                        }
                        if (element2.sub.length > 0) {
                            element2.dataValues.type = 'dropDown'
                            element.dataValues.path = undefined
                            for (let index3 = 0; index3 < element2.sub.length; index3++) {
                                const element3 = element2.sub[index3];
                                if (Permission.filter(e => e.id === element3.id).length == 0) {
                                    Permission.push(element_(element3))
                                }
                                if (element3.sub.length == 0) {
                                    element3.dataValues.sub = undefined
                                    element3.dataValues.type = 'link'
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    user.dataValues.MenuList = application;
    user.dataValues.Permission = Permission;

    await handleSaveLog(request, [['mydata'], '']);
    return ({
        status: 'success',
        data: user
    });
}

/**
 * Session handle concurrent when creating domain
 */
const sessionCheckingSubDomainName = {};

/**
 * A handler from route [POST] => /api/user/register
 * @param {import("../types/type.Handler.User").IHandlerUserRegisterRequest || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 * @return {Promise<{status: "success", data: {shopsProfile: ShopsProfiles, user: User, usersProfile: UsersProfiles}}>}
 */
const handleUserRegister = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST handleUserRegister';

    const fnReportErrorWithoutWait = (error = '') => {
        handleSaveLog(request, [[action], error])
            .catch(e => console.log(e));
    };

    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    try {
        const {
            user_data,
            shop_profile_data,
            user_profile_data
        } = request.body;

        if (!_.isPlainObject(user_data) || !_.isPlainObject(user_profile_data) || !_.isPlainObject(shop_profile_data)) {
            throw Error('Request data not complete');
        }
        else {
            if (!utilNginxIsFormatSubDomainNameValid(shop_profile_data.domain_name.sub_domain_name)) {
                throw Error('Sub domain name is not valid');
            }

            if (isPlainObject(sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`])) {
                throw Error('Registering this sub domain name is running in another session, please try again later');
            }

            const sub_domain_name_duplicate = await utilNginxIsConfigSubDomainExists(shop_profile_data.domain_name.sub_domain_name);
            if (sub_domain_name_duplicate.exists) {
                throw Error('Sub Domain name already exists');
            }

            // Handle concurrent when creating domain
            sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`] = {
                instanceTimeout: setTimeout(() => {
                    delete sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`];
                }, utilConvertStringToNumberMilliseconds("3s"))
            };

            const user_duplicate = await User.findAll({ where: { user_name: user_data.user_name } });
            if (user_duplicate[0]) {
                throw Error('user_name already');
            }

            if (!isNull(user_data.e_mail)) {
                const email_duplicate = await User.findAll({ where: { e_mail: user_data.e_mail } });
                if (email_duplicate[0]) {
                    throw Error('e_mail already');
                }
            }

            const transactionResult = await sequelize.transaction(
                {
                    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                },
                async (t) => {
                    /**
                     * A function create user
                     * - 1st pipeline to crate these request data
                     * @param {ISchemaHandlerUserRegisterRequest.Body.user_data} userDoc
                     * @param {import("sequelize").Transaction} txn seqTransaction
                     * @return {Promise<User>}
                     */
                    const createUserData = async (userDoc = user_data, txn = t) => {
                        const createUserDocument = await User.create(
                            {
                                ...userDoc,
                                status: 1,
                                password: generateHashPassword(userDoc.password),
                                created_date: currentDateTime,
                                created_by: request.id
                            },
                            {
                                transaction: txn
                            }
                        );
                        return createUserDocument;
                    };


                    /**
                     * A function create shop profile
                     * - 2nd pipeline to crate these request data
                     * @param {ISchemaHandlerUserRegisterRequest.Body.shop_profile_data} shopProfileDoc
                     * @param {import("sequelize").Transaction} txn seqTransaction
                     * @return {Promise<import("../models/ShopsProfiles/ShopsProfiles")>}
                     */
                    const createShopsProfileData = async (shopProfileDoc = shop_profile_data, txn = t) => {
                        const getSeq = await utilGetModelShopsProfilesNextSeq("01", "HQ");
                        const createShopProfileDocument = await ShopsProfiles.create(
                            {
                                ...shopProfileDoc,
                                created_date: currentDateTime,
                                created_by: request.id,
                                ...getSeq,
                            },
                            {
                                transaction: txn
                            }
                        );
                        return createShopProfileDocument;
                    };


                    /**
                     * A function create user profile
                     * - 3rd pipeline to crate these request data
                     * @param {string} userId
                     * @param {string} shopProfileId
                     * @param {ISchemaHandlerUserRegisterRequest.Body.user_profile_data} userProfileDoc
                     * @param {import("sequelize").Transaction} txn seqTransaction
                     * @return {Promise<UsersProfiles>}
                     */
                    const createUserProfileData = async (userId = "", shopProfileId = "", userProfileDoc = user_profile_data, txn = t) => {
                        const createUserProfileDocument = await UsersProfiles.create(
                            {
                                ...userProfileDoc,
                                user_id: userId,
                                shop_id: shopProfileId,
                                created_date: currentDateTime,
                                created_by: request.id
                            },
                            {
                                transaction: txn
                            }
                        );
                        return createUserProfileDocument;
                    };

                    /**
                     * A function create dynamic tables from models
                     * @param {import("sequelize/types/model").Model[]} models
                     * @param {import("sequelize").Transaction} txn seqTransaction
                     */
                    const createDynamicTablesFromModel = async (models = [], txn = t) => {
                        for (let i = 0; i < models.length; i++) {
                            const model = models[i];
                            await model.sync({
                                alter: false,
                                transaction: txn
                            });
                        }
                    };

                    const createdUserDocument = await createUserData(user_data, t);
                    const createdShopProfileDocument = await createShopsProfileData(shop_profile_data, t);
                    const createdUserProfileDocument = await createUserProfileData(createdUserDocument.getDataValue("id"), createdShopProfileDocument.getDataValue("id"), user_profile_data, t);

                    const createTableResult = await createDynamicTablesFromModel(
                        [
                            modelShopPersonalCustomers(createdShopProfileDocument.shop_code_id),
                            modelShopBusinessCustomers(createdShopProfileDocument.shop_code_id),
                            modelShopVehiclesCustomers(createdShopProfileDocument.shop_code_id),
                            modelShopWarehouse(createdShopProfileDocument.shop_code_id),
                            modelShopBusinessPartners(createdShopProfileDocument.shop_code_id),
                            modelShopInventoryTransaction(createdShopProfileDocument.shop_code_id),
                            modelShopProduct(createdShopProfileDocument.shop_code_id),
                            modelShopProductPriceLog(createdShopProfileDocument.shop_code_id),
                            modelShopStock(createdShopProfileDocument.shop_code_id),
                            modelShopInventory(createdShopProfileDocument.shop_code_id),
                            modelShopSalesTransaction(createdShopProfileDocument.shop_code_id),
                            modelShopSalesOrderPlanLogs(createdShopProfileDocument.shop_code_id),
                            modelShopSalesTransactionOut(createdShopProfileDocument.shop_code_id),
                            modelShopInventoryPurchasingPreOrderDoc(createdShopProfileDocument.shop_code_id),
                            modelShopInventoryPurchasingPreOrderProductList(createdShopProfileDocument.shop_code_id),
                            modelShopProductsHoldWYZauto(createdShopProfileDocument.shop_code_id),
                            modelShopPurchaseOrderDoc(createdShopProfileDocument.shop_code_id),
                            modelShopPurchaseOrderList(createdShopProfileDocument.shop_code_id),
                            modelShopQuotationDoc(createdShopProfileDocument.shop_code_id),
                            modelShopQuotationList(createdShopProfileDocument.shop_code_id),
                            modelShopLegacySalesOut(createdShopProfileDocument.shop_code_id),
                            modelShopDocumentCode(createdShopProfileDocument.shop_code_id),
                            modelShopServiceOrderDoc(createdShopProfileDocument.shop_code_id),
                            modelShopServiceOrderList(createdShopProfileDocument.shop_code_id),
                            modelShopTemporaryDeliveryOrderDoc(createdShopProfileDocument.shop_code_id),
                            modelShopTemporaryDeliveryOrderList(createdShopProfileDocument.shop_code_id),
                            modelShopTaxInvoiceDoc(createdShopProfileDocument.shop_code_id),
                            modelShopTaxInvoiceList(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtDebitNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtDebitNoteList(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtCreditNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtCreditNoteList(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtBillingNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtBillingNoteList(createdShopProfileDocument.shop_code_id),

                            modelShopPartnerDebtDebitNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtDebitNoteList(createdShopProfileDocument.shop_code_id),

                            modelShopPartnerDebtCreditNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtCreditNoteList(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtDoc(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtList(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtDoc(createdShopProfileDocument.shop_code_id),
                            modelShopCustomerDebtList(createdShopProfileDocument.shop_code_id),
                            modelShopPaymentTransaction(createdShopProfileDocument.shop_code_id),
                            modelShopInventoryMovementLogs(createdShopProfileDocument.shop_code_id),
                            modelShopBank(createdShopProfileDocument.shop_code_id),
                            modelShopCheckCustomer(createdShopProfileDocument.shop_code_id),
                            modelShopAppointment(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtBillingNoteDoc(createdShopProfileDocument.shop_code_id),
                            modelShopPartnerDebtBillingNoteList(createdShopProfileDocument.shop_code_id)

                        ],
                        t
                    );

                    if (createdUserDocument.dataValues.password) {
                        delete createdUserDocument.dataValues.password;
                    }

                    const domainName = String(shop_profile_data.domain_name.sub_domain_name);
                    // .replace(/[^A-Za-z\-]/, '');
                    if (domainName.length > 1) {
                        await utilNginxCreateConfigSubDomain(domainName)
                            .catch(e => { fnReportErrorWithoutWait(e); });
                    }

                    // Handle concurrent when creating domain is finished
                    if (isPlainObject(sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`])) {
                        clearTimeout(sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`].instanceTimeout);
                        delete sessionCheckingSubDomainName[`${shop_profile_data.domain_name.sub_domain_name}.${shop_profile_data.domain_name.domain_name}`];
                    }

                    await utilNginxCommandTestConfig()
                        .then(async (r) => {
                            if (r.status === true) {
                                await utilNginxCommandReload()
                                    .catch(e => { fnReportErrorWithoutWait(e); });
                            }
                        })
                        .catch(e => { fnReportErrorWithoutWait(e); });

                    return {
                        user: createdUserDocument,
                        usersProfile: createdUserProfileDocument,
                        shopsProfile: createdShopProfileDocument
                    };
                }
            );

            await handleSaveLog(request, [[action], '']);

            return {
                status: 'success',
                data: transactionResult
            };
        }
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        throw error;
    }
};


const handleUserAdd = async (request, response) => {
    var action = 'add user'
    try {
        var { user_name, password, e_mail, group_id, note } = request.body

        if (isNull(user_name)) {
            await handleSaveLog(request, [[action], 'user_name null'])
            return ({ status: "failed", data: "user_name can not null" })
        }
        if (isNull(password)) {
            await handleSaveLog(request, [[action], 'password null'])
            return ({ status: "failed", data: "password can not null" })
        }
        const user_id = await User.findAll({ where: { id: request.id } });
        const user_duplicate = await User.findAll({ where: { user_name: user_name } });
        if (user_duplicate[0]) {
            await handleSaveLog(request, [[action], 'user_name already'])
            return ({ status: "failed", data: "user_name already" })
        }
        if (!isNull(e_mail)) {
            const email_duplicate = await User.findAll({ where: { e_mail: e_mail } });
            if (email_duplicate[0]) {
                await handleSaveLog(request, [[action], 'e_mail already'])
                return ({ status: "failed", data: "e_mail already" })
            }
        }

        if (group_id && group_id.length > 0) {

            var check_group = true
            var group_exist
            await new Promise(async (resolve) => {
                group_id.forEach(async (element, index, array) => {

                    group_exist = await Group.findAll({ where: { id: element } });
                    if (!group_exist[0]) {
                        check_group = false
                    }

                    if (index === array.length - 1) resolve();
                });
            })

            if (check_group == false) {
                await handleSaveLog(request, [[action], 'group_id not found'])
                return ({ status: "failed", data: "group_id not found" })
            }

        }

        password = generateHashPassword(password)
        const status = 1

        var user_create = await User.create({
            user_name: user_name,
            password: password,
            e_mail: e_mail,
            note: note,
            status: status,
            created_by: user_id[0].id,
            created_date: Date.now()
        })

        if (group_id && group_id.length > 0) {
            await new Promise(async (resolve) => {
                group_id.forEach(async (element, index, array) => {
                    await MapUserGroup.create({
                        user_id: user_create.id,
                        group_id: element
                    })

                    await handleSaveLog(request, [['map user with group', element, user_create.id], ''])

                    if (index === array.length - 1) resolve();
                });

            })
            // return ({ status: "successful", data: "success" })
        }

        await handleSaveLog(request, [[action, user_create.id, request.body], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}


const handleUserAll = async (request, res) => {
    try {
        const id = request.id

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search;
        const sort = request.query.sort;
        const order = request.query.order;
        let status = request.query.status || 'default';
        const selectInAuth = request.query.selectInAuth || false;

        if (status == 'block') {
            status = [0];
        } else if (status == 'active') {
            status = [1]
        } else if (status == 'delete') {
            status = [2]
        } else {
            status = [0, 1];
        }

        let user_oauth = [];
        if (selectInAuth == true) {
            user_oauth = await Oauth.findAll()
            if (user_oauth.length > 0) {
                user_oauth = user_oauth.map(el => { return el.user_id })

            }

        }

        const user = await Promise.all([
            User.findAll({
                attributes: {
                    exclude: ['token_set']
                },
                include: [
                    {
                        model: Group,
                        through: {
                            attributes: [],
                        },
                        attributes: ['id', 'group_name'],
                        required: false,
                        where: { isuse: [1] }
                    },
                    {
                        model: Oauth
                    },
                    {
                        model: UsersProfiles
                    }
                ],
                where: {
                    [Op.and]: { status: status, id: { [Op.notIn]: user_oauth } },
                    [Op.or]: [
                        { user_name: { [Op.like]: '%' + search + '%' } },
                        { e_mail: { [Op.like]: '%' + search + '%' } },
                        { "$group_name$": { [Op.like]: '%' + search + '%' } },
                    ]
                }
            })
        ]);

        await handleSaveLog(request, [['get user all'], '']);

        return ({ status: 'success', data: paginate(user[0], limit, page) });
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get user all'], 'error : ' + error]);
        return ({ status: "failed", data: error });
    }
}

const handleUserById = async (request) => {
    try {
        const user_id = request.params.id;
        const find_user = await User.findOne({
            attributes: {
                exclude: ['token_set']
            },
            include: [
                {
                    model: Group,
                    through: { attributes: [] },
                    attributes: ['id', 'group_name'],
                    required: false,
                    where: { isuse: [1] }
                },
                {
                    model: UsersProfiles
                }
            ],
            where: {
                id: user_id
            }
        });

        if (!find_user) {
            await handleSaveLog(request, [['get user byid'], 'user  not found']);
            return ({ status: "failed", data: "user not found" });
        } else {
            await handleSaveLog(request, [['get user byid'], '']);
            return ({ status: "successful", data: [find_user] });
        }

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get user byid'], 'error : ' + error]);
        return ({ status: "failed", data: error });
    }
}

const handleUserPut = async (request) => {
    var action = 'put user'
    try {
        const currentDateTime = Date.now();
        let { user_name, password, e_mail, group_id, note } = request.body
        let status_user = request.body.status
        let user_id = request.params.id
        let data = {}
        /**
         * A request for update UsersProfiles
         * @type {{} | null}
         */
        let UsersProfiles_Data = _.get(request, "body.user_profile_data", null);

        const find_user = await User.findAll({ where: { id: user_id } });
        if (!find_user[0]) {
            await handleSaveLog(request, [[action], 'user not found'])
            return ({ status: "failed", data: "user not found" })
        }
        if (!isNull(user_name)) {
            const user_duplicate = await User.findAll({
                where: {
                    [Op.and]: [{ user_name: user_name }, { [Op.not]: [{ id: user_id }] }],
                }
            });
            if (user_duplicate[0]) {
                await handleSaveLog(request, [[action], 'user_name already'])
                return ({ status: "failed", data: "user_name already" })
            } else {
                data.user_name = user_name
            }
        }
        if (!isNull(password)) {
            data.password = generateHashPassword(password)
        }

        if (typeof e_mail !== 'undefined') {
            if (e_mail != null) {
                const email_duplicate = await User.findAll({
                    where: {
                        [Op.and]: [{ e_mail: e_mail }, { [Op.not]: [{ id: user_id }] }],
                    }
                });
                if (email_duplicate[0]) {
                    await handleSaveLog(request, [[action], 'e_mail already'])
                    return ({ status: "failed", data: "e_mail already" })
                } else {
                    data.e_mail = e_mail
                }
            } else {
                data.e_mail = e_mail
            }
        }

        if (group_id && group_id.length > 0 && group_id != 'null') {

            var check_group = true
            var group_exist
            await new Promise(async (resolve) => {
                group_id.forEach(async (element, index, array) => {

                    group_exist = await Group.findAll({ where: { id: element } });
                    if (!group_exist[0]) {
                        check_group = false
                    }

                    if (index === array.length - 1) resolve();
                });
            })

            if (check_group == false) {
                await handleSaveLog(request, [[action], 'group_id not found'])
                return ({ status: "failed", data: "group_id not found" })
            }

        }


        if (typeof note !== 'undefined') {
            data.note = note
        }
        if (!isNull(status_user)) {
            if (status_user == 'delete') {
                data.status = 2
            } else if (status_user == 'active') {
                data.status = 1
            } else if (status_user == 'block') {
                data.status = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }
        data.updated_by = request.id
        data.updated_date = currentDateTime

        var before_update = await User.findOne({
            where: {
                id: user_id
            }
        });

        await User.update(data, {
            where: {
                id: user_id
            }
        });

        if (group_id && group_id != 'null') {
            await MapUserGroup.destroy({
                where: {
                    user_id: user_id
                }
            })

            if (group_id.length > 0) {
                await new Promise((resolve) => {
                    group_id.forEach(async (element, index, array) => {
                        await MapUserGroup.create({
                            user_id: user_id,
                            group_id: element
                        })
                        await handleSaveLog(request, [['map user with group', element, user_id], ''])
                        if (index === array.length - 1) resolve();
                    });
                })
            }


            // return ({ status: "successful", data: "success" })
        }

        // Update Document from Model "UsersProfile" when request json contains object "UsersProfiles"
        if (UsersProfiles_Data) {
            await UsersProfiles.update(
                {
                    ...UsersProfiles_Data,
                    ...utilGetIsUse(_.get(UsersProfiles_Data, "status", "default")),
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        user_id: user_id
                    }
                }
            );

            await handleSaveLog(request, [['put user with UserProfile', user_id], '']);
        }

        await handleSaveLog(request, [[action, user_id, request.body, before_update], '']);
        return ({ status: "successful", data: "success" });

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    handleUserMe,
    handleUserRegister,
    handleUserAdd,
    handleUserAll,
    handleUserPut,
    handleUserById,
    handleUserMe_1
}