const Log = require("./Log/Log");
const User = require("./Users/User");
const Role = require("./Role/Role");
const Access = require("./Access/Access");
const Application = require("./Application/Application");
const Group = require("./Groups/Group");
const MapUserGroup = require("./MapUserGroup/MapUserGroup");
const UsersProfiles = require("./UsersProfiles/UsersProfiles");
const ShopsProfiles = require("./ShopsProfiles/ShopsProfiles");
const ShopHq = require("./ShopHq/ShopHq");
const MatchShopHq = require("./MatchShopHq/MatchShopHq");
const Departments = require("./Master/Departments");
const SubDistrict = require("./Master/SubDIstrict");
const District = require("./Master/DIstrict");
const Province = require("./Master/Province");
const ActivityPoint = require("./ActivityPoint/ActivityPoint");
const ActivityPointOption = require("./ActivityPointOption/ActivityPointOption");
const BusinessType = require("./Master/BusinessType");
const Customer = require("./Customer/Customer");
const Dealers = require("./Dealers/Dealers");
const MatchCustomerDealer = require("./MatchCustomerDealer/MatchCustomerDealer");
const DealerPoint = require("./DealerPoint/DealerPoint");
const DealerPointBalance = require("./DealerPointBalance/DealerPointBalance");
const BankNameList = require("./Master/BankNameList");
const DocumentTypeGroups = require("./Master/DocumentTypeGroups");
const DocumentTypes = require("./Master/DocumentTypes");
const MapRegProv = require("./Master/MapRegProv");
const NameTitle = require("./Master/NameTitle");
const Region = require("./Master/Region");
const TaxTypes = require("./Master/TaxTypes");
const VehicleBrand = require("./Master/VehicleBrand");
const VehicleColor = require("./Master/VehicleColor");
const VehicleType = require("./Master/VehicleType");
const VehicleModelType = require("./Master/VehicleModelType");
const Oauth = require("./Oauth/Oauth");
const ProductType = require("./ProductType/ProductType");
const Product = require("./Product/Product");
const ProductBrand = require("./ProductBrand/ProductBrand");
const ProductCompleteSize = require("./ProductCompleteSize/ProductCompleteSize");
const ProductModelType = require("./ProductModelType/ProductModelType");
const ProductPurchaseUnitTypes = require("./Master/ProductPurchaseUnitTypes");
const ProductTypeGroup = require("./ProductTypeGroup/ProductTypeGroup");
const ProductOwner = require("./ProductOwner/ProductOwner");
const Sessions = require("./Sessions/Sessions");
const ThirdPartyApi = require("./ThirdPartyApi/ThirdPartyApi");
const ThirdPartyApiConnectData = require("./ThirdPartyApiConnectData/ThirdPartyApiConnectData");
const StockBalance = require("./WebMax/StockBalance");
const SubmitSales = require("./WebMax/SubmitSales");
const Tags = require("./Tags/Tags");
const ExpensesTypeGroup = require("./Master/ExpensesTypeGroup");
const ExpensesType = require("./Master/ExpensesType");

const ShopAppointment = require("./ShopAppointment/ShopAppointment");
const ShopBusinessCustomers = require("./ShopBusinessCustomers/ShopBusinessCustomers");
const ShopPersonalCustomers = require("./ShopPersonalCustomers/ShopPersonalCustomers");
const ShopBusinessPartners = require("./ShopBusinessPartners/ShopBusinessPartners");
const ShopVehicleCustomer = require("./ShopVehicleCustomer/ShopVehicleCustomer");
const ShopDocumentCode = require("./ShopDocumentCode/ShopDocumentCode");
const ShopInventory = require("./ShopInventory/ShopInventory");
const ShopInventoryAdjustmentDoc = require("./ShopInventoryAdjustmentDoc/ShopInventoryAdjustmentDoc");
const ShopProduct = require("./ShopProduct/ShopProduct");
const ShopInventoryTransaction = require("./ShopInventoryTransaction/ShopInventoryTransaction");
const ShopSalesTransactionDoc = require("./ShopSalesTransactionDoc/ShopSalesTransactionDoc");
const ShopSalesOrderPlanLogs = require("./ShopSalesOrderPlanLogs/ShopSalesOrderPlanLogs");
const ShopStock = require("./ShopStock/ShopStock");
const ShopProductsHoldWYZauto = require("./ShopProductsHoldWYZauto/ShopProductsHoldWYZauto");
const ShopWarehouse = require("./ShopWarehouses/ShopWarehouses");
const ShopInventoryMovementLog = require("./ShopInventoryMovementLog/ShopInventoryMovementLog");
const ShopInventoryPurchasingPreOrderDoc = require("./ShopInventoryPurchasingPreOrderDoc/ShopInventoryPurchasingPreOrderDoc");
const ShopInventoryPurchasingPreOrderProductList = require("./ShopInventoryPurchasingPreOrderProductList/ShopInventoryPurchasingPreOrderProductList");
const ShopLegacySalesOut = require("./ShopLegacySalesOut/ShopLegacySalesOut");
const ShopProductPriceLog = require("./ShopProduct/ShopProductPriceLog");
const ShopPurchaseOrderDoc = require("./ShopPurchaseOrderDoc/ShopPurchaseOrderDoc");
const ShopPurchaseOrderList = require("./ShopPurchaseOrderList/ShopPurchaseOrderList");
const ShopQuotationDoc = require("./ShopQuotationDoc/ShopQuotationDoc");
const ShopQuotationList = require("./ShopQuotationList/ShopQuotationList");
const ShopSalesQuotationsLogs = require("./ShopSalesQuotationsLogs/ShopSalesQuotationsLogs");
const ShopSalesTransactionOut = require("./ShopSalesTransactionOut/ShopSalesTransactionOut");
const ShopServiceOrderDoc = require("./ShopServiceOrderDoc/ShopServiceOrderDoc");
const ShopServiceOrderList = require("./ShopServiceOrderList/ShopServiceOrderList");
const ShopTemporaryDeliveryOrderDoc = require("./ShopTemporaryDeliveryOrderDoc/ShopTemporaryDeliveryOrderDoc");
const ShopTemporaryDeliveryOrderList = require("./ShopTemporaryDeliveryOrderList/ShopTemporaryDeliveryOrderList");
const ShopTaxInvoiceDoc = require("./ShopTaxInvoiceDoc/ShopTaxInvoiceDoc");
const ShopTaxInvoiceList = require("./ShopTaxInvoiceList/ShopTaxInvoiceList");
const ShopCustomerDebtDebitNoteDoc = require("./ShopCustomerDebtDebitNoteDoc/ShopCustomerDebtDebitNoteDoc");
const ShopCustomerDebtDebitNoteList = require("./ShopCustomerDebtDebitNoteList/ShopCustomerDebtDebitNoteList");
const ShopCustomerDebtCreditNoteDoc = require("./ShopCustomerDebtCreditNoteDoc/ShopCustomerDebtCreditNoteDoc");
const ShopCustomerDebtCreditNoteList = require("./ShopCustomerDebtCreditNoteList/ShopCustomerDebtCreditNoteList");
const ShopCustomerDebtCreditNoteDocT2 = require("./ShopCustomerDebtCreditNoteDocT2/ShopCustomerDebtCreditNoteDocT2");
const ShopCustomerDebtCreditNoteListT2 = require("./ShopCustomerDebtCreditNoteListT2/ShopCustomerDebtCreditNoteListT2");
const ShopCustomerDebtBillingNoteDoc = require("./ShopCustomerDebtBillingNoteDoc/ShopCustomerDebtBillingNoteDoc");
const ShopCustomerDebtBillingNoteList = require("./ShopCustomerDebtBillingNoteList/ShopCustomerDebtBillingNoteList");
const ShopCustomerDebtDoc = require("./ShopCustomerDebtDoc/ShopCustomerDebtDoc");
const ShopCustomerDebtList = require("./ShopCustomerDebtList/ShopCustomerDebtList");
const ShopPartnerDebtDebitNoteDoc = require("./ShopPartnerDebtDebitNoteDoc/ShopPartnerDebtDebitNoteDoc");
const ShopPartnerDebtDebitNoteList = require("./ShopPartnerDebtDebitNoteList/ShopPartnerDebtDebitNoteList");
const ShopPartnerDebtCreditNoteDoc = require("./ShopPartnerDebtCreditNoteDoc/ShopPartnerDebtCreditNoteDoc");
const ShopPartnerDebtCreditNoteList = require("./ShopPartnerDebtCreditNoteList/ShopPartnerDebtCreditNoteList");
const ShopPaymentTransaction = require("./ShopPaymentTransaction/ShopPaymentTransaction");
const ShopShipAddressCustomer = require("./ShopShipAddressCustomer/ShopShipAddressCustomer");
const ShopContactCustomer = require("./ShopContactCustomer/ShopContactCustomer");
const ShopBank = require("./ShopBank/ShopBank");
const ShopCheckCustomer = require("./ShopCheckCustomer/ShopCheckCustomer");
const ShopPartnerDebtDoc = require("./ShopPartnerDebtDoc/ShopPartnerDebtDoc");
const ShopPartnerDebtList = require("./ShopPartnerDebtList/ShopPartnerDebtList")
const ShopPartnerDebtBillingNoteDoc = require("./ShopPartnerDebtBillingNoteDoc/ShopPartnerDebtBillingNoteDoc");
const ShopPartnerDebtBillingNoteList = require("./ShopPartnerDebtBillingNoteList/ShopPartnerDebtBillingNoteList");
// Model: Log

// Model: User
User.hasOne(UsersProfiles, { foreignKey: 'user_id' });
User.hasOne(Oauth, { foreignKey: 'user_id' });

// Model: Role

// Model: Access
Access.belongsTo(Application, { foreignKey: 'id' });

// Model: Application
Application.belongsTo(Access, { foreignKey: 'access' });
Application.hasMany(Application, { as: 'children', foreignKey: 'parent_menu' });
Application.hasMany(Application, { as: 'sub', foreignKey: 'parent_menu' });

// Model: Group
Group.hasOne(Departments, { foreignKey: 'user_group_id' });
Group.hasMany(Group, { as: 'children', foreignKey: 'parent_id' });

// Model: MapUserGroup
User.belongsToMany(Group, { through: MapUserGroup, foreignKey: 'user_id' });
User.hasMany(MapUserGroup, { foreignKey: 'user_id' });
MapUserGroup.belongsTo(User, { foreignKey: 'user_id' });
Group.belongsToMany(User, { through: MapUserGroup, foreignKey: 'group_id' });
Group.hasOne(MapUserGroup, { foreignKey: 'group_id' });
MapUserGroup.belongsTo(Group, { foreignKey: 'group_id' });

// Model: UsersProfiles
UsersProfiles.belongsTo(ShopsProfiles, { foreignKey: 'shop_id' });
UsersProfiles.belongsTo(ShopHq, { foreignKey: 'hq_id' });

// Model: ShopsProfiles
ShopsProfiles.hasOne(UsersProfiles, { foreignKey: 'shop_id' });
ShopsProfiles.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id' });
ShopsProfiles.belongsTo(District, { foreignKey: 'district_id' });
ShopsProfiles.belongsTo(Province, { foreignKey: 'province_id' });
ShopsProfiles.belongsToMany(ShopHq, { through: MatchShopHq, foreignKey: 'shop_id' });

// Model: ShopHq
ShopHq.hasMany(UsersProfiles, { foreignKey: 'hq_id' });
ShopHq.belongsToMany(ShopsProfiles, { through: MatchShopHq, foreignKey: 'hq_id' });

// Model: Departments
Departments.belongsTo(Group, { foreignKey: 'user_group_id' });

// Model: SubDistrict
SubDistrict.hasOne(ShopsProfiles, { foreignKey: 'subdistrict_id' });
SubDistrict.hasOne(Customer, { foreignKey: 'subdistrict_id' });
District.hasOne(Customer, { foreignKey: 'district_id' });
SubDistrict.hasOne(Dealers, { foreignKey: 'subdistrict_id' });

// Model: District
District.hasOne(ShopsProfiles, { foreignKey: 'district_id' });
District.hasOne(Dealers, { foreignKey: 'district_id' });

// Model: Province
Province.hasOne(ShopsProfiles, { foreignKey: 'province_id' });
Province.hasOne(Customer, { foreignKey: 'province_id' });
Province.hasOne(Dealers, { foreignKey: 'province_id' });
Province.hasMany(MapRegProv, { foreignKey: 'prov_id' });
Province.belongsToMany(Region, { through: 'MapRegProv', foreignKey: 'prov_id' });

// Model: ActivityPoint
ActivityPoint.hasOne(DealerPoint, { foreignKey: 'activity_point_id' });

// Model: ActivityPointOption
ActivityPointOption.hasOne(DealerPoint, { foreignKey: 'activity_point_option_id' });

// Model: BusinessType
BusinessType.hasOne(Customer, { foreignKey: 'bus_type_id' });
BusinessType.hasOne(Dealers, { foreignKey: 'bus_type_id' });

// Model: Customer
Customer.belongsTo(BusinessType, { foreignKey: 'bus_type_id' });
Customer.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id' });
Customer.belongsTo(District, { foreignKey: 'district_id' });
Customer.belongsTo(Province, { foreignKey: 'province_id' });
Customer.belongsToMany(Dealers, { through: MatchCustomerDealer, foreignKey: 'customer_id' });
Customer.hasOne(DealerPoint, { foreignKey: 'customer_id' });
Customer.hasOne(DealerPointBalance, { foreignKey: 'customer_id' });
Customer.hasOne(SubmitSales, { foreignKey: 'customer_id' });

// Model: Dealers
Dealers.belongsToMany(Customer, { through: MatchCustomerDealer, foreignKey: 'dealer_id' });
Dealers.belongsTo(BusinessType, { foreignKey: 'bus_type_id' });
Dealers.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id' });
Dealers.belongsTo(District, { foreignKey: 'district_id' });
Dealers.belongsTo(Province, { foreignKey: 'province_id' });
Dealers.hasOne(DealerPoint, { foreignKey: 'dealer_id' });
Dealers.hasOne(DealerPointBalance, { foreignKey: 'dealer_id' });
Dealers.hasOne(StockBalance, { foreignKey: 'dealer_id' });
Dealers.hasOne(SubmitSales, { foreignKey: 'dealer_id' });

// Model: DealerPoint
DealerPoint.belongsTo(Dealers, { foreignKey: 'dealer_id' });
DealerPoint.belongsTo(ActivityPointOption, { foreignKey: 'activity_point_option_id' });
DealerPoint.belongsTo(ActivityPoint, { foreignKey: 'activity_point_id' });
DealerPoint.belongsTo(Customer, { foreignKey: 'customer_id' });
DealerPoint.hasOne(DealerPointBalance, { foreignKey: 'dealer_point_id' });

// Model: DealerPointBalance
DealerPointBalance.belongsTo(Dealers, { foreignKey: 'dealer_id' });
DealerPointBalance.belongsTo(Customer, { foreignKey: 'customer_id' });
DealerPointBalance.belongsTo(DealerPoint, { foreignKey: 'dealer_point_id' });

// Model: DocumentTypeGroups
DocumentTypeGroups.belongsTo(User, { foreignKey: 'created_by' });
DocumentTypeGroups.belongsTo(User, { foreignKey: 'updated_by' });
DocumentTypeGroups.hasOne(DocumentTypes, { foreignKey: 'type_group_id' });

// Model: DocumentTypes
DocumentTypes.belongsTo(DocumentTypeGroups, { foreignKey: 'type_group_id' });
DocumentTypes.belongsTo(User, { foreignKey: 'created_by' });
DocumentTypes.belongsTo(User, { foreignKey: 'updated_by' });

// Model: ExpensesTypeGroups
ExpensesTypeGroup.belongsTo(User, { foreignKey: 'created_by' });
ExpensesTypeGroup.belongsTo(User, { foreignKey: 'updated_by' });
ExpensesTypeGroup.hasOne(ExpensesType, { foreignKey: 'type_group_id' });

// Model: ExpensesTypes
ExpensesType.belongsTo(ExpensesTypeGroup, { foreignKey: 'type_group_id' });
ExpensesType.belongsTo(User, { foreignKey: 'created_by' });
ExpensesType.belongsTo(User, { foreignKey: 'updated_by' });


// Model: MapRegProv
MapRegProv.belongsTo(Province, { foreignKey: 'prov_id' });
MapRegProv.belongsTo(Region, { foreignKey: 'reg_id' });

// Model: NameTitle

// Model: Region
Region.hasMany(MapRegProv, { foreignKey: 'reg_id', });
MapRegProv.belongsTo(Region, { foreignKey: 'reg_id' })
Region.belongsToMany(Province, { through: 'MapRegProv', foreignKey: 'reg_id' });

// Model: TaxTypes
TaxTypes.belongsTo(User, { foreignKey: 'created_by' });
TaxTypes.belongsTo(User, { foreignKey: 'updated_by' });

// Model: VehicleBrand
VehicleBrand.belongsTo(User, { foreignKey: 'created_by' });
VehicleBrand.belongsTo(User, { foreignKey: 'updated_by' });
VehicleBrand.hasMany(VehicleModelType, { foreignKey: 'vehicles_brand_id' });

// Model: VehicleColor
VehicleColor.belongsTo(User, { foreignKey: 'created_by' });
VehicleColor.belongsTo(User, { foreignKey: 'updated_by' });

// Model: VehicleType
VehicleType.hasOne(VehicleModelType, { foreignKey: 'vehicle_type_id' })

// Model: VehicleModelType
VehicleModelType.belongsTo(VehicleBrand, { foreignKey: 'vehicles_brand_id' })
VehicleModelType.belongsTo(VehicleType, { foreignKey: 'vehicle_type_id' })

// Model: Oauth
Oauth.belongsTo(User, { foreignKey: 'user_id' });

// Model: ProductType
ProductType.belongsTo(ProductTypeGroup, { foreignKey: 'type_group_id' });
ProductType.hasMany(ProductPurchaseUnitTypes, { foreignKey: 'type_group_id', sourceKey: 'type_group_id' });
ProductType.hasOne(Product, { foreignKey: 'product_type_id' });
ProductType.hasMany(ProductModelType, { foreignKey: 'product_type_id' });

// Model: Product
Product.belongsTo(ProductType, { foreignKey: 'product_type_id' });
Product.belongsTo(ProductBrand, { foreignKey: 'product_brand_id' });
Product.belongsTo(ProductCompleteSize, { foreignKey: 'complete_size_id' });
Product.belongsTo(ProductModelType, { foreignKey: 'product_model_id' });
Product.hasOne(StockBalance, { foreignKey: 'product_id' });
Product.hasOne(SubmitSales, { foreignKey: 'product_id' });

// Model: ProductBrand
ProductBrand.hasOne(Product, { foreignKey: 'product_brand_id' });
ProductBrand.hasMany(ProductModelType, { foreignKey: 'product_brand_id' });

// Model: ProductCompleteSize
ProductCompleteSize.hasOne(Product, { foreignKey: 'complete_size_id' });

// Model: ProductModelType
ProductModelType.hasOne(Product, { foreignKey: 'product_model_id' });
ProductModelType.belongsTo(ProductType, { foreignKey: 'product_type_id' });
ProductModelType.belongsTo(ProductBrand, { foreignKey: 'product_brand_id' });

// Model: ProductPurchaseUnitTypes
ProductPurchaseUnitTypes.belongsTo(ProductTypeGroup, { foreignKey: 'type_group_id', as: 'ProductTypeGroup' });
ProductPurchaseUnitTypes.belongsTo(User, { foreignKey: 'created_by' });
ProductPurchaseUnitTypes.belongsTo(User, { foreignKey: 'updated_by' });

// Model: ProductTypeGroup
ProductTypeGroup.hasMany(ProductType, { foreignKey: 'type_group_id' });

// Model: ProductOwner

// Model: Sessions

// Model: ThirdPartyApi
ThirdPartyApi.belongsTo(User, { foreignKey: 'created_by' });
ThirdPartyApi.belongsTo(User, { foreignKey: 'updated_by' });

// Model: ThirdPartyApiConnectData
ThirdPartyApiConnectData.belongsTo(ShopsProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
ThirdPartyApiConnectData.belongsTo(ThirdPartyApi, { foreignKey: 'third_party_sys_id' });
ThirdPartyApiConnectData.belongsTo(User, { foreignKey: 'created_by' });
ThirdPartyApiConnectData.belongsTo(User, { foreignKey: 'updated_by' });

// Model: WebMax StockBalance
StockBalance.belongsTo(Dealers, { foreignKey: 'dealer_id' });
StockBalance.belongsTo(Product, { foreignKey: 'product_id' });

// Model: WebMax SubmitSales
SubmitSales.belongsTo(Dealers, { foreignKey: 'dealer_id' });
SubmitSales.belongsTo(Customer, { foreignKey: 'customer_id' });
SubmitSales.belongsTo(Product, { foreignKey: 'product_id' });

const initShopModel = (table_name) => {
    const _ShopProduct = ShopProduct(table_name);
    const _ShopStock = ShopStock(table_name);
    const _ShopWarehouse = ShopWarehouse(table_name);
    const _ShopPersonalCustomer = ShopPersonalCustomers(table_name);
    const _ShopBusinessCustomer = ShopBusinessCustomers(table_name);
    const _ShopBusinessPartner = ShopBusinessPartners(table_name);
    const _ShopVehicleCustomer = ShopVehicleCustomer(table_name);
    const _ShopShipAddressCustomer = ShopShipAddressCustomer(table_name);
    const _ShopContactCustomer = ShopContactCustomer(table_name);
    const _ShopBank = ShopBank(table_name);
    const _ShopCheckCustomer = ShopCheckCustomer(table_name);
    const _ShopInventoryImportDoc = ShopInventoryTransaction(table_name);
    const _ShopInventoryImportList = ShopInventory(table_name);
    const _ShopSalesTransactionDoc = ShopSalesTransactionDoc(table_name);
    const _ShopSalesOrderPlanLogs = ShopSalesOrderPlanLogs(table_name);
    const _ShopServiceOrderDoc = ShopServiceOrderDoc(table_name);
    const _ShopServiceOrderList = ShopServiceOrderList(table_name);
    const _ShopTemporaryDeliveryOrderDoc = ShopTemporaryDeliveryOrderDoc(table_name);
    const _ShopTemporaryDeliveryOrderList = ShopTemporaryDeliveryOrderList(table_name);
    const _ShopTaxInvoiceDoc = ShopTaxInvoiceDoc(table_name);
    const _ShopTaxInvoiceList = ShopTaxInvoiceList(table_name);
    const _ShopCustomerDebtDebitNoteDoc = ShopCustomerDebtDebitNoteDoc(table_name);
    const _ShopCustomerDebtDebitNoteList = ShopCustomerDebtDebitNoteList(table_name);
    const _ShopCustomerDebtCreditNoteDoc = ShopCustomerDebtCreditNoteDoc(table_name);
    const _ShopCustomerDebtCreditNoteList = ShopCustomerDebtCreditNoteList(table_name);
    const _ShopCustomerDebtCreditNoteDocT2 = ShopCustomerDebtCreditNoteDocT2(table_name);
    const _ShopCustomerDebtCreditNoteListT2 = ShopCustomerDebtCreditNoteListT2(table_name);
    const _ShopCustomerDebtBillingNoteDoc = ShopCustomerDebtBillingNoteDoc(table_name);
    const _ShopCustomerDebtBillingNoteList = ShopCustomerDebtBillingNoteList(table_name);
    const _ShopCustomerDebtDoc = ShopCustomerDebtDoc(table_name);
    const _ShopCustomerDebtList = ShopCustomerDebtList(table_name);
    const _ShopPartnerDebtDebitNoteDoc = ShopPartnerDebtDebitNoteDoc(table_name);
    const _ShopPartnerDebtDoc = ShopPartnerDebtDoc(table_name);
    const _ShopPartnerDebtList = ShopPartnerDebtList(table_name);
    const _ShopPartnerDebtDebitNoteList = ShopPartnerDebtDebitNoteList(table_name);
    const _ShopPartnerDebtCreditNoteDoc = ShopPartnerDebtCreditNoteDoc(table_name);
    const _ShopPartnerDebtCreditNoteList = ShopPartnerDebtCreditNoteList(table_name);
    const _ShopPaymentTransaction = ShopPaymentTransaction(table_name);
    const _ShopInventoryMovementLog = ShopInventoryMovementLog(table_name);
    const _ShopPartnerDebtBillingNoteDoc = ShopPartnerDebtBillingNoteDoc(table_name);
    const _ShopPartnerDebtBillingNoteList = ShopPartnerDebtBillingNoteList(table_name);

    // Model: DocumentTypes
    DocumentTypes.hasMany(_ShopServiceOrderDoc, { foreignKey: 'doc_type_id' });

    // Model: TaxTypes
    TaxTypes.hasMany(_ShopServiceOrderDoc, { foreignKey: 'tax_type_id' });

    // Model: ProductPurchaseUnitTypes
    ProductPurchaseUnitTypes.hasMany(_ShopServiceOrderList, { foreignKey: 'purchase_unit_id' });

    // Model: ShopsProfiles
    ShopsProfiles.hasMany(_ShopServiceOrderDoc, { foreignKey: 'shop_id' });
    ShopsProfiles.hasMany(_ShopServiceOrderList, { foreignKey: 'shop_id' });

    // Shop Model: ShopProduct
    _ShopProduct.hasMany(_ShopServiceOrderList, { foreignKey: 'shop_product_id' });

    // Shop Model: ShopStock
    _ShopStock.hasMany(_ShopServiceOrderList, { foreignKey: 'shop_stock_id' });

    // Shop Model: ShopWarehouse
    _ShopWarehouse.hasMany(_ShopServiceOrderList, { foreignKey: 'shop_warehouse_id' });

    // Shop Model: ShopPersonalCustomers
    _ShopPersonalCustomer.hasMany(_ShopVehicleCustomer, { foreignKey: 'per_customer_id' });
    _ShopPersonalCustomer.hasMany(_ShopServiceOrderDoc, { foreignKey: 'per_customer_id' });

    // Shop Model: ShopBusinessCustomers
    _ShopBusinessCustomer.hasMany(_ShopVehicleCustomer, { foreignKey: 'bus_customer_id' });
    _ShopBusinessCustomer.hasMany(_ShopServiceOrderDoc, { foreignKey: 'bus_customer_id' });

    // Shop Model: ShopVehicleCustomer
    _ShopVehicleCustomer.hasMany(_ShopServiceOrderDoc, { foreignKey: 'vehicle_customer_id' });

    // Shop Model: ShopInventoryImportDoc
    _ShopInventoryImportDoc.hasMany(_ShopInventoryImportList, { foreignKey: 'doc_inventory_id', as: 'ShopInventoryImportLists' });

    // Shop Model: ShopInventoryImportList

    // Shop Model: ShopSalesTransactionDoc
    _ShopSalesTransactionDoc.hasMany(_ShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' });

    // Shop Model: ShopSalesOrderPlanLogs

    // Shop Model: ShopServiceOrderDoc
    _ShopServiceOrderDoc.hasMany(_ShopServiceOrderList, { foreignKey: 'shop_service_order_doc_id' });
    _ShopServiceOrderDoc.hasMany(_ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_service_order_doc_id' });
    _ShopServiceOrderDoc.hasMany(_ShopTaxInvoiceDoc, { foreignKey: 'shop_service_order_doc_id' });
    _ShopServiceOrderDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_service_order_doc_id' });

    // Shop Model: ShopServiceOrderList

    // Shop Model: ShopTemporaryDeliveryOrderDoc
    _ShopTemporaryDeliveryOrderDoc.hasMany(_ShopTemporaryDeliveryOrderList, { foreignKey: 'shop_temporary_delivery_order_doc_id' });
    _ShopTemporaryDeliveryOrderDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_temporary_delivery_order_doc_id' });
    _ShopTemporaryDeliveryOrderDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_tax_invoice_doc_id' });

    // Shop Model: ShopTemporaryDeliveryOrderList

    // Shop Model: ShopTaxInvoiceDoc
    _ShopTaxInvoiceDoc.hasMany(_ShopTaxInvoiceList, { foreignKey: 'shop_tax_invoice_doc_id' });

    // Shop Model: ShopTaxInvoiceList

    // Shop Model: ShopCustomerDebtDebitNoteDoc
    _ShopCustomerDebtDebitNoteDoc.hasMany(_ShopCustomerDebtDebitNoteList, { foreignKey: 'shop_customer_debt_dn_doc_id' });

    // Shop Model: ShopCustomerDebtDebitNoteList
    _ShopCustomerDebtDebitNoteList.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_customer_debt_dn_doc_id' });

    // Shop Model: ShopCustomerDebtCreditNoteDoc
    _ShopCustomerDebtCreditNoteDoc.hasMany(_ShopCustomerDebtCreditNoteList, { foreignKey: 'shop_customer_debt_cn_doc_id' });

    // Shop Model: ShopCustomerDebtCreditNoteDocT2
    _ShopCustomerDebtCreditNoteDocT2.hasMany(_ShopCustomerDebtCreditNoteListT2, { foreignKey: 'shop_customer_debt_cn_doc_id' });

    // Shop Model: ShopCustomerDebtCreditNoteList
    _ShopCustomerDebtCreditNoteList.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_customer_debt_cn_doc_id' });

    // Shop Model: ShopCustomerDebtCreditNoteList
    _ShopCustomerDebtCreditNoteListT2.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_customer_debt_cn_doc_id_t2' });


    // Shop Model: ShopCustomerDebtBillingNoteDoc
    _ShopCustomerDebtBillingNoteDoc.hasMany(_ShopCustomerDebtBillingNoteList, { foreignKey: 'shop_customer_debt_bn_doc_id' });

    // Shop Model: ShopCustomerDebtBillingNoteList

    // Shop Model: ShopCustomerDebtDoc
    _ShopCustomerDebtDoc.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_customer_debt_doc_id' });
    _ShopCustomerDebtDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_customer_debt_doc_id' });

    // Shop Model: ShopPartnerDebtDebitNoteDoc
    _ShopPartnerDebtDebitNoteDoc.hasMany(_ShopPartnerDebtDebitNoteList, { foreignKey: 'shop_partner_debt_dn_doc_id' });
    _ShopPartnerDebtDebitNoteList.hasMany(_ShopPartnerDebtList, { foreignKey: 'shop_partner_debt_dn_doc_id' });
    _ShopPartnerDebtCreditNoteList.hasMany(_ShopPartnerDebtList, { foreignKey: 'shop_partner_debt_cn_doc_id' });

    // Shop Model: ShopPartnerDebtDoc
    _ShopPartnerDebtDoc.hasMany(_ShopPartnerDebtList, { foreignKey: 'shop_partner_debt_doc_id' });
    _ShopPartnerDebtDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_partner_debt_doc_id' });


    _ShopInventoryImportDoc.hasMany(_ShopPaymentTransaction, { foreignKey: 'shop_inventory_transaction_id' });


    // Shop Model: ShopPartnerDebtBillingNoteDoc
    _ShopPartnerDebtBillingNoteDoc.hasMany(_ShopPartnerDebtBillingNoteList, { foreignKey: 'shop_partner_debt_bn_doc_id' });


    // Shop Model: ShopPartnerDebtDebitNoteList

    // Shop Model: ShopPartnerDebtCreditNoteDoc
    _ShopPartnerDebtCreditNoteDoc.hasMany(_ShopPartnerDebtCreditNoteList, { foreignKey: 'shop_partner_debt_cn_doc_id' });

    // Shop Model: ShopPartnerDebtCreditNoteList

    // Shop Model: ShopCustomerDebtList
    _ShopServiceOrderDoc.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_service_order_doc_id' });
    _ShopTemporaryDeliveryOrderDoc.hasMany(_ShopCustomerDebtList, { foreignKey: 'shop_temporary_delivery_order_doc_id' });


    // Shop Model: ShopPaymentTransaction

    return {
        ShopProduct: _ShopProduct,
        ShopStock: _ShopStock,
        ShopPersonalCustomer: _ShopPersonalCustomer,
        ShopBusinessCustomer: _ShopBusinessCustomer,
        ShopBusinessPartner: _ShopBusinessPartner,
        ShopVehicleCustomer: _ShopVehicleCustomer,
        ShopShipAddressCustomer: _ShopShipAddressCustomer,
        ShopContactCustomer: _ShopContactCustomer,
        ShopBank: _ShopBank,
        ShopCheckCustomer: _ShopCheckCustomer,
        ShopInventoryImportDoc: _ShopInventoryImportDoc,
        ShopInventoryImportList: _ShopInventoryImportList,
        ShopSalesTransactionDoc: _ShopSalesTransactionDoc,
        ShopSalesOrderPlanLogs: _ShopSalesOrderPlanLogs,
        ShopServiceOrderDoc: _ShopServiceOrderDoc,
        ShopServiceOrderList: _ShopServiceOrderList,
        ShopTemporaryDeliveryOrderDoc: _ShopTemporaryDeliveryOrderDoc,
        ShopTemporaryDeliveryOrderList: _ShopTemporaryDeliveryOrderList,
        ShopTaxInvoiceDoc: _ShopTaxInvoiceDoc,
        ShopTaxInvoiceList: _ShopTaxInvoiceList,
        ShopCustomerDebtDebitNoteDoc: _ShopCustomerDebtDebitNoteDoc,
        ShopCustomerDebtDebitNoteList: _ShopCustomerDebtDebitNoteList,
        ShopCustomerDebtCreditNoteDoc: _ShopCustomerDebtCreditNoteDoc,
        ShopCustomerDebtCreditNoteList: _ShopCustomerDebtCreditNoteList,
        ShopCustomerDebtCreditNoteDocT2: _ShopCustomerDebtCreditNoteDocT2,
        ShopCustomerDebtCreditNoteListT2: _ShopCustomerDebtCreditNoteListT2,
        ShopCustomerDebtBillingNoteDoc: _ShopCustomerDebtBillingNoteDoc,
        ShopCustomerDebtBillingNoteList: _ShopCustomerDebtBillingNoteList,
        ShopCustomerDebtDoc: _ShopCustomerDebtDoc,
        ShopCustomerDebtList: _ShopCustomerDebtList,
        ShopPartnerDebtDebitNoteDoc: _ShopPartnerDebtDebitNoteDoc,
        ShopPartnerDebtDoc: _ShopPartnerDebtDoc,
        ShopPartnerDebtDebitNoteList: _ShopPartnerDebtDebitNoteList,
        ShopPartnerDebtCreditNoteDoc: _ShopPartnerDebtCreditNoteDoc,
        ShopPartnerDebtCreditNoteList: _ShopPartnerDebtCreditNoteList,
        ShopPartnerDebtBillingNoteDoc: _ShopPartnerDebtBillingNoteDoc,
        ShopPartnerDebtBillingNoteList: _ShopPartnerDebtBillingNoteList,
        ShopPartnerDebtList: _ShopPartnerDebtList,
        ShopPaymentTransaction: _ShopPaymentTransaction,
        ShopInventoryMovementLog: _ShopInventoryMovementLog
    };
};

module.exports = {
    initShopModel,
    Log,
    User,
    Role,
    Access,
    Application,
    Group,
    MapUserGroup,
    UsersProfiles,
    ShopsProfiles,
    ShopHq,
    MatchShopHq,
    Departments,
    SubDistrict,
    District,
    Province,
    ActivityPoint,
    ActivityPointOption,
    BusinessType,
    Customer,
    Dealers,
    MatchCustomerDealer,
    DealerPoint,
    DealerPointBalance,
    BankNameList,
    DocumentTypeGroups,
    DocumentTypes,
    MapRegProv,
    NameTitle,
    Region,
    TaxTypes,
    VehicleBrand,
    VehicleColor,
    VehicleType,
    VehicleModelType,
    Oauth,
    ProductType,
    Product,
    ProductBrand,
    ProductCompleteSize,
    ProductModelType,
    ProductPurchaseUnitTypes,
    ProductTypeGroup,
    ProductOwner,
    Sessions,
    ThirdPartyApi,
    ThirdPartyApiConnectData,
    StockBalance,
    SubmitSales,
    Tags,
    ExpensesType,
    ExpensesTypeGroup,


    ShopAppointment,
    ShopBusinessCustomers,
    ShopPersonalCustomers,
    ShopBusinessPartners,
    ShopVehicleCustomer,
    ShopShipAddressCustomer,
    ShopContactCustomer,
    ShopBank,
    ShopCheckCustomer,
    ShopDocumentCode,
    ShopInventory,
    ShopInventoryAdjustmentDoc,
    ShopProduct,
    ShopInventoryTransaction,
    ShopSalesTransactionDoc,
    ShopSalesOrderPlanLogs,
    ShopStock,
    ShopProductsHoldWYZauto,
    ShopWarehouse,
    ShopInventoryMovementLog,
    ShopInventoryPurchasingPreOrderDoc,
    ShopInventoryPurchasingPreOrderProductList,
    ShopLegacySalesOut,
    ShopProductPriceLog,
    ShopPurchaseOrderDoc,
    ShopPurchaseOrderList,
    ShopQuotationDoc,
    ShopQuotationList,
    ShopSalesQuotationsLogs,
    ShopSalesTransactionOut,
    ShopServiceOrderDoc,
    ShopServiceOrderList,
    ShopTemporaryDeliveryOrderDoc,
    ShopTemporaryDeliveryOrderList,
    ShopTaxInvoiceDoc,
    ShopTaxInvoiceList,
    ShopCustomerDebtDebitNoteDoc,
    ShopCustomerDebtDebitNoteList,
    ShopCustomerDebtCreditNoteDoc,
    ShopCustomerDebtCreditNoteList,
    ShopCustomerDebtCreditNoteDocT2,
    ShopCustomerDebtCreditNoteListT2,
    ShopCustomerDebtBillingNoteDoc,
    ShopCustomerDebtBillingNoteList,
    ShopCustomerDebtDoc,
    ShopCustomerDebtList,
    ShopPartnerDebtDebitNoteDoc,
    ShopPartnerDebtDoc,
    ShopPartnerDebtList,
    ShopPartnerDebtDebitNoteList,
    ShopPartnerDebtCreditNoteDoc,
    ShopPartnerDebtCreditNoteList,
    ShopPartnerDebtBillingNoteDoc,
    ShopPartnerDebtBillingNoteList,
    ShopPaymentTransaction
};