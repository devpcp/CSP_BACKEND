const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    subDistrict,
    district,
    province,
    taxTypes,
    taxTypesAdd,
    taxTypesPut,
    taxTypesByid
} = require('../handlers/master');
const {
    sub_district,
    dis_trict,
    pro_vince,
    tax_types,
    tax_types_add,
    tax_types_put,
    tax_types_byid
} = require('../models/Master/schema');

/**
 * Route => /api/master
 * @param {import("fastify").FastifyInstance} app
 */
const masterRouters = async (app) => {

    // Route [GET] => /api/master/businessType
    app.route({
        method: "GET",
        url: "/businessType",
        schema: require("../models/Master/Model.Schema.Master.BusinessType").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BusinessType").handleAllRaw
    });

    // Route [GET] => /api/master/businessType/all
    app.route({
        method: "GET",
        url: "/businessType/all",
        schema: require("../models/Master/Model.Schema.Master.BusinessType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BusinessType").handleAll
    });

    // Route [GET] => /api/master/businessType/all
    app.route({
        method: "POST",
        url: "/businessType/add",
        schema: require("../models/Master/Model.Schema.Master.BusinessType").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BusinessType").handleAdd
    });

    // Route [GET] => /api/master/businessType/byid
    app.route({
        method: "GET",
        url: "/businessType/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.BusinessType").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BusinessType").handleById
    });

    // Route [PUT] => /api/master/businessType/put
    app.route({
        method: "PUT",
        url: "/businessType/put/:id",
        schema: require("../models/Master/Model.Schema.Master.BusinessType").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BusinessType").handlePut
    });

    // Route [GET] => /api/master/nameTitle
    app.route({
        method: "GET",
        url: "/nameTitle",
        schema: require("../models/Master/Model.Schema.Master.NameTitle").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.NameTitle").handleAllRaw
    });

    // Route [GET] => /api/master/nameTitle/all
    app.route({
        method: "GET",
        url: "/nameTitle/all",
        schema: require("../models/Master/Model.Schema.Master.NameTitle").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.NameTitle").handleAll
    });

    // Route [GET] => /api/master/nameTitle/all
    app.route({
        method: "POST",
        url: "/nameTitle/add",
        schema: require("../models/Master/Model.Schema.Master.NameTitle").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.NameTitle").handleAdd
    });

    // Route [GET] => /api/master/nameTitle/byid
    app.route({
        method: "GET",
        url: "/nameTitle/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.NameTitle").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.NameTitle").handleById
    });

    // Route [PUT] => /api/master/nameTitle/put
    app.route({
        method: "PUT",
        url: "/nameTitle/put/:id",
        schema: require("../models/Master/Model.Schema.Master.NameTitle").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.NameTitle").handlePut
    });

    // Route [GET] => /api/master/documentTypeGroup
    app.route({
        method: "GET",
        url: "/documentTypeGroup",
        schema: require("../models/Master/Model.Schema.Master.DocumentTypeGroup").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentTypeGroup").handleAllRaw
    });


    // Route [GET] => /api/master/documentTypeGroup/all
    app.route({
        method: "GET",
        url: "/documentTypeGroup/all",
        schema: require("../models/Master/Model.Schema.Master.DocumentTypeGroup").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentTypeGroup").handleAll
    });

    // Route [GET] => /api/master/documentTypeGroup/all
    app.route({
        method: "POST",
        url: "/documentTypeGroup/add",
        schema: require("../models/Master/Model.Schema.Master.DocumentTypeGroup").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentTypeGroup").handleAdd
    });

    // Route [GET] => /api/master/documentTypeGroup/byid
    app.route({
        method: "GET",
        url: "/documentTypeGroup/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.DocumentTypeGroup").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentTypeGroup").handleById
    });

    // Route [PUT] => /api/master/documentTypeGroup/put
    app.route({
        method: "PUT",
        url: "/documentTypeGroup/put/:id",
        schema: require("../models/Master/Model.Schema.Master.DocumentTypeGroup").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentTypeGroup").handlePut
    });


    // Route [GET] => /api/master/documentType
    app.route({
        method: "GET",
        url: "/documentTypes",
        schema: require("../models/Master/Model.Schema.Master.DocumentType").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentType").handleAllRaw
    });

    // Route [GET] => /api/master/documentType/all
    app.route({
        method: "GET",
        url: "/documentType/all",
        schema: require("../models/Master/Model.Schema.Master.DocumentType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentType").handleAll
    });

    // Route [GET] => /api/master/documentType/all
    app.route({
        method: "POST",
        url: "/documentType/add",
        schema: require("../models/Master/Model.Schema.Master.DocumentType").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentType").handleAdd
    });

    // Route [GET] => /api/master/documentType/byid
    app.route({
        method: "GET",
        url: "/documentType/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.DocumentType").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentType").handleById
    });

    // Route [PUT] => /api/master/documentType/put
    app.route({
        method: "PUT",
        url: "/documentType/put/:id",
        schema: require("../models/Master/Model.Schema.Master.DocumentType").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.DocumentType").handlePut
    });

    // Route [GET] => /api/master/province
    app.route({
        method: "GET",
        url: "/province",
        schema: pro_vince,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: province
    });

    // Route [GET] => /api/master/district
    app.route({
        method: "GET",
        url: "/district",
        schema: dis_trict,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: district
    });

    // Route [GET] => /api/master/subDistrict
    app.route({
        method: "GET",
        url: "/subDistrict",
        schema: sub_district,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: subDistrict
    });

    // Route [GET] => /api/master/taxTypes
    app.route({
        method: "GET",
        url: "/taxTypes",
        schema: tax_types,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: taxTypes
    });

    // Route [GET] => /api/master/taxTypes/all
    app.route({
        method: "GET",
        url: "/taxTypes/all",
        schema: tax_types,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: taxTypes
    });

    // Route [GET] => /api/master/taxTypes
    app.route({
        method: "GET",
        url: "/taxTypes/byid/:id",
        schema: tax_types_byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: taxTypesByid
    });

    // Route [POST] => /api/master/taxTypes
    app.route({
        method: "POST",
        url: "/taxTypes/add",
        schema: tax_types_add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: taxTypesAdd
    });

    // Route [PUT] => /api/master/taxTypes
    app.route({
        method: "PUT",
        url: "/taxTypes/put/:id",
        schema: tax_types_put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: taxTypesPut
    });

    // Route [GET] => /api/master/productPurchaseUnitTypes
    app.route({
        method: "GET",
        url: "/productPurchaseUnitTypes",
        schema: require("../models/Master/Model.Schema.Master.ProductPurchaseUnitTypes").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ProductPurchaseUnitTypes.All")
    });
    // Route [GET] => /api/master/productPurchaseUnitTypes/all
    app.route({
        method: "GET",
        url: "/productPurchaseUnitTypes/all",
        schema: require("../models/Master/Model.Schema.Master.ProductPurchaseUnitTypes").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ProductPurchaseUnitTypes.All")
    });
    // Route [GET] => /api/master/productPurchaseUnitTypes/byid/:id
    app.route({
        method: "GET",
        url: "/productPurchaseUnitTypes/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.ProductPurchaseUnitTypes").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ProductPurchaseUnitTypes.ById")
    });
    // Route [POST] => /api/master/productPurchaseUnitTypes/add
    app.route({
        method: "POST",
        url: "/productPurchaseUnitTypes/add",
        schema: require("../models/Master/Model.Schema.Master.ProductPurchaseUnitTypes").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ProductPurchaseUnitTypes.Add")
    });
    // Route [GET] => /api/master/productPurchaseUnitTypes/put/:id
    app.route({
        method: "PUT",
        url: "/productPurchaseUnitTypes/put/:id",
        schema: require("../models/Master/Model.Schema.Master.ProductPurchaseUnitTypes").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ProductPurchaseUnitTypes.Put")
    });

    // Route [GET] => /api/master/vehicleType
    app.route({
        method: "GET",
        url: "/vehicleType",
        schema: require("../models/Master/Model.Schema.Master.VehicleType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleType").handleAll
    });


    // Route [POST] => /api/master/vehicleType/add
    app.route({
        method: "POST",
        url: "/vehicleType/add",
        schema: require("../models/Master/Model.Schema.Master.VehicleType").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleType").handleAdd
    });
    // Route [GET] => /api/master/vehicleType/all
    app.route({
        method: "GET",
        url: "/vehicleType/all",
        schema: require("../models/Master/Model.Schema.Master.VehicleType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleType").handleAll
    });
    // Route [GET] => /api/master/vehicleType/byid/:id
    app.route({
        method: "GET",
        url: "/vehicleType/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleType").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleType").handleById
    });
    // Route [PUT] => /api/master/vehicleType/put/:id
    app.route({
        method: "PUT",
        url: "/vehicleType/put/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleType").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleType").handlePut
    });


    // Route [POST] => /api/master/vehicleBrand/add
    app.route({
        method: "POST",
        url: "/vehicleBrand/add",
        schema: require("../models/Master/Model.Schema.Master.VehicleBrand").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleBrand").handleAdd
    });
    // Route [GET] => /api/master/vehicleBrand
    app.route({
        method: "GET",
        url: "/vehicleBrand",
        schema: require("../models/Master/Model.Schema.Master.VehicleBrand").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleBrand").handleAll
    });
    // Route [GET] => /api/master/vehicleBrand/all
    app.route({
        method: "GET",
        url: "/vehicleBrand/all",
        schema: require("../models/Master/Model.Schema.Master.VehicleBrand").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleBrand").handleAll
    });
    // Route [GET] => /api/master/vehicleBrand/byid/:id
    app.route({
        method: "GET",
        url: "/vehicleBrand/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleBrand").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleBrand").handleById
    });
    // Route [PUT] => /api/master/vehicleBrand/put/:id
    app.route({
        method: "PUT",
        url: "/vehicleBrand/put/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleBrand").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleBrand").handlePut
    });

    // Route [GET] => /api/master/vehicleModelType
    app.route({
        method: "GET",
        url: "/vehicleModelType",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleAllRaw
    });

    // Route [GET] => /api/master/vehicleModelType/all
    app.route({
        method: "GET",
        url: "/vehicleModelType/all",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleAll
    });
    // Route [GET] => /api/master/vehicleModelType/byid/:id
    app.route({
        method: "GET",
        url: "/vehicleModelType/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleById
    });
    // Route [GET] => /api/master/vehicleModelType/byTypeBrand/all
    app.route({
        method: "GET",
        url: "/vehicleModelType/byTypeBrand/all",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").bytypebrandall,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleByTypeBrandAll
    })
    // Route [GET] => /api/master/vehicleModelType/byTypeBrand/:vehicles_brand_id
    app.route({
        method: "GET",
        url: "/vehicleModelType/byTypeBrand/:vehicles_brand_id",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").bytypebrand,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleByTypeBrand
    })

    // Route [POST] => /api/master/vehicleModelType/add
    app.route({
        method: "POST",
        url: "/vehicleModelType/add",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handleAdd
    });
    // Route [PUT] => /api/master/vehicleModelType/putbybrandid/:id
    app.route({
        method: "PUT",
        url: "/vehicleModelType/byTypeBrand/:vehicles_brand_id",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handlePut
    });
    // Route [POST] => /api/master/vehicleModelType/checkduplicate
    app.route({
        method: "POST",
        url: "/vehicleModelType/checkduplicate",
        schema: require("../models/Master/Model.Schema.Master.VehicleModelType").checkduplicate,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleModelType").handelCheckDuplicate
    });


    // Route [GET] => /api/master/departments
    app.route({
        method: "GET",
        url: "/departments",
        schema: require("../models/Master/Model.Schema.Master.Departments").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.Departments.All")
    });
    // Route [GET] => /api/master/departments/all
    app.route({
        method: "GET",
        url: "/departments/all",
        schema: require("../models/Master/Model.Schema.Master.Departments").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.Departments.All")
    });

    // Route [POST] => /api/master/departments/add
    app.route({
        method: "POST",
        url: "/departments/add",
        schema: require("../models/Master/Model.Schema.Master.Departments").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.Departments.Add")
    });

    // Route [GET] => /api/master/departments/byid/:id
    app.route({
        method: "GET",
        url: "/departments/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.Departments").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.Departments.ById")
    });
    // Route [PUT] => /api/master/departments/put/:id
    app.route({
        method: "PUT",
        url: "/departments/put/:id",
        schema: require("../models/Master/Model.Schema.Master.Departments").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.Departments.Put")
    });


    app.route({
        method: "GET",
        url: "/region",
        schema: require("../models/Master/Model.Schema.Master.Region").region_all_raw,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Master.Region").regionAllRaw
    })

    app.route({
        method: "GET",
        url: "/region/all",
        schema: require("../models/Master/Model.Schema.Master.Region").region_all,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Master.Region").regionAll
    })


    app.route({
        method: "PUT",
        url: "/region/put/:id",
        schema: require("../models/Master/Model.Schema.Master.Region").region_put,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Master.Region").regionPut
    })

    app.route({
        method: "POST",
        url: "/region/add",
        schema: require("../models/Master/Model.Schema.Master.Region").region_add,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Master.Region").regionAdd
    })

    app.route({
        method: "GET",
        url: "/region/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.Region").region_byid,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Master.Region").regionById
    })


    app.route({
        method: "GET",
        url: "/bankNameList",
        schema: require("../models/Master/Model.Schema.Master.BankNameList").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BankNameList").handleAllRaw
    });

    app.route({
        method: "GET",
        url: "/bankNameList/all",
        schema: require("../models/Master/Model.Schema.Master.BankNameList").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BankNameList").handleAll
    });

    app.route({
        method: "POST",
        url: "/bankNameList/add",
        schema: require("../models/Master/Model.Schema.Master.BankNameList").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BankNameList").handleAdd
    });

    app.route({
        method: "GET",
        url: "/bankNameList/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.BankNameList").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BankNameList").handleById
    });

    app.route({
        method: "PUT",
        url: "/bankNameList/put/:id",
        schema: require("../models/Master/Model.Schema.Master.BankNameList").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.BankNameList").handlePut
    });


    app.route({
        method: "GET",
        url: "/vehicleColor",
        schema: require("../models/Master/Model.Schema.Master.VehicleColor").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleColor").handleAllRaw
    });

    app.route({
        method: "GET",
        url: "/vehicleColor/all",
        schema: require("../models/Master/Model.Schema.Master.VehicleColor").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleColor").handleAll
    });

    app.route({
        method: "POST",
        url: "/vehicleColor/add",
        schema: require("../models/Master/Model.Schema.Master.VehicleColor").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleColor").handleAdd
    });

    app.route({
        method: "GET",
        url: "/vehicleColor/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleColor").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleColor").handleById
    });

    app.route({
        method: "PUT",
        url: "/vehicleColor/put/:id",
        schema: require("../models/Master/Model.Schema.Master.VehicleColor").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.VehicleColor").handlePut
    });




    // Route [GET] => /api/master/expensesTypeGroup
    app.route({
        method: "GET",
        url: "/expensesTypeGroup",
        schema: require("../models/Master/Model.Schema.Master.ExpensesTypeGroup").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesTypeGroup").handleAllRaw
    });


    // Route [GET] => /api/master/expensesTypeGroup/all
    app.route({
        method: "GET",
        url: "/expensesTypeGroup/all",
        schema: require("../models/Master/Model.Schema.Master.ExpensesTypeGroup").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesTypeGroup").handleAll
    });

    // Route [GET] => /api/master/expensesTypeGroup/add
    app.route({
        method: "POST",
        url: "/expensesTypeGroup/add",
        schema: require("../models/Master/Model.Schema.Master.ExpensesTypeGroup").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesTypeGroup").handleAdd
    });

    // Route [GET] => /api/master/expensesTypeGroup/byid
    app.route({
        method: "GET",
        url: "/expensesTypeGroup/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.ExpensesTypeGroup").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesTypeGroup").handleById
    });

    // Route [PUT] => /api/master/expensesTypeGroup/put
    app.route({
        method: "PUT",
        url: "/expensesTypeGroup/put/:id",
        schema: require("../models/Master/Model.Schema.Master.ExpensesTypeGroup").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesTypeGroup").handlePut
    });


    // Route [GET] => /api/master/expensesType
    app.route({
        method: "GET",
        url: "/expensesTypes",
        schema: require("../models/Master/Model.Schema.Master.ExpensesType").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesType").handleAllRaw
    });

    // Route [GET] => /api/master/expensesType/all
    app.route({
        method: "GET",
        url: "/expensesType/all",
        schema: require("../models/Master/Model.Schema.Master.ExpensesType").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesType").handleAll
    });

    // Route [GET] => /api/master/expensesType/all
    app.route({
        method: "POST",
        url: "/expensesType/add",
        schema: require("../models/Master/Model.Schema.Master.ExpensesType").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesType").handleAdd
    });

    // Route [GET] => /api/master/expensesType/byid
    app.route({
        method: "GET",
        url: "/expensesType/byid/:id",
        schema: require("../models/Master/Model.Schema.Master.ExpensesType").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesType").handleById
    });

    // Route [PUT] => /api/master/expensesType/put
    app.route({
        method: "PUT",
        url: "/expensesType/put/:id",
        schema: require("../models/Master/Model.Schema.Master.ExpensesType").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Master.ExpensesType").handlePut
    });
};


module.exports = masterRouters;