const utilConvertStringToNumberSeconds = require("./utils/util.ConvertStringToNumberSeconds");
const { isUUID } = require("./utils/generate");

/**
 * An application system variables of config variables this system
 */
const config = {
    /**
     * A config variable of NODE_ENV
     * @type {string}
     */
    env: process.env.NODE_ENV || 'development',
    /**
     * A config variable of fastify expose port
     * @type {number | string}
     */
    port: process.env.PORT || 3000,
    /**
     * A config variable of fastify expose network
     * @type {string}
     */
    host: process.env.HOST || '0.0.0.0',
    /**
     * A config variable of fastify swagger expose host and or with port
     * @type {string}
     */
    config_swagger_url: process.env.SWAGGER_URL || `localhost:${process.env.PORT || 3000}`,
    /**
     * A config variable of fastify to enable cors in app
     */
    config_fastify_enable_cors: process.env.FASTIFY_ENABLE_CORS && process.env.FASTIFY_ENABLE_CORS.toLowerCase() === 'true',


    //get from DB on systems.sysm_application 
    application_role_id: process.env.APPLICATION_ROLE_ID,
    access_role_id: process.env.ACCESS_ROLE_ID,
    user_role_id: process.env.USER_ROLE_ID,
    group_role_id: process.env.GROUP_ROLE_ID,

    //get from DB on systems.sysm_access_levels
    publish_access_id: process.env.PUBLISH_ACCESS_ID,

    //systems.sysm_user_groups
    quest_group_id: process.env.GUEST_GROUP_ID,

    web_max: process.env.WEBMAX_URL,

    // Defined of authorization
    /**
     * A config of skip verifying expiration of "access_token"
     * - .env "SKIP_VERIFY_ACCESS_TOKEN"
     * - If you want to, please set into "true" value
     */
    config_skip_verify_access_token: process.env.SKIP_VERIFY_ACCESS_TOKEN && process.env.SKIP_VERIFY_ACCESS_TOKEN.toLowerCase() === 'true',
    /**
     * A config of Jwt claims "iss" (Issuer) who is generator Jwt tokens, says that your api server URL
     * - .env "ACCESS_TOKEN_ISSUER_URL"
     */
    config_access_token_issuer_url: process.env.ACCESS_TOKEN_ISSUER_URL || `http://localhost:${process.env.PORT || 3000}`,
    /**
     * A config of schedule countdown update "login_status" when no activity from client to this api server
     * - .env "ACCESS_TOKEN_ENGINE_SESSION_TIME"
     * - defined in "seconds"
     * - example: 60 (means that is 60 second count down when no active)
     */
    config_access_token_engine_session_time: process.env.ACCESS_TOKEN_ENGINE_SESSION_TIME ? utilConvertStringToNumberSeconds(process.env.ACCESS_TOKEN_ENGINE_SESSION_TIME) : utilConvertStringToNumberSeconds("60s"),

    // Defined of authorization via Login
    /**
     * A config of expiration time of "refresh_token" with modifier
     * - .env "REFRESH_TOKEN_EXPIRATION_TIME"
     * - Modifier
     *      - "s" = Seconds
     *      - "m" = Minutes
     *      - "h" = Hours
     *      - "d" = Days
     * - example: "20m"
     * - example: "350h"
     */
    config_refresh_token_expiration_time: process.env.REFRESH_TOKEN_EXPIRATION_TIME ? utilConvertStringToNumberSeconds(process.env.REFRESH_TOKEN_EXPIRATION_TIME) : utilConvertStringToNumberSeconds("30d"),
    /**
     * A config of secret password of "access_token" where to sign JWT
     * - .env "ACCESS_TOKEN_SECRET"
     */
    config_access_token_secret: process.env.ACCESS_TOKEN_SECRET || `NooRat&Like-toPlay#$ALONE^`,
    /**
     * A config of expiration time of "access_token" with modifier
     * - .env "ACCESS_TOKEN_EXPIRATION_TIME"
     * - Modifier
     *      - "s" = Seconds
     *      - "m" = Minutes
     *      - "h" = Hours
     *      - "d" = Days
     * - example: "20m"
     * - example: "350h"
     */
    config_access_token_expiration_time: process.env.ACCESS_TOKEN_EXPIRATION_TIME ? utilConvertStringToNumberSeconds(process.env.ACCESS_TOKEN_EXPIRATION_TIME) : utilConvertStringToNumberSeconds("60s"),

    // Defined of authorization via OAuth
    /**
     * A config session lifetime of "Code" via OAuth
     * - .env "CODE_TOKEN_EXPIRATION_TIME_OAUTH"
     * - Modifier
     *      - "s" = Seconds
     *      - "m" = Minutes
     *      - "h" = Hours
     *      - "d" = Days
     * - example: "20m"
     * - example: "350h"
     * - data using in seconds
     */
    config_code_token_expiration_time_oauth: process.env.CODE_TOKEN_EXPIRATION_TIME_OAUTH ? utilConvertStringToNumberSeconds(process.env.CODE_TOKEN_EXPIRATION_TIME_OAUTH) : utilConvertStringToNumberSeconds("30m"),
    /**
     * A config session lifetime of "refresh_token" via OAuth
     * - Modifier
     *      - "s" = Seconds
     *      - "m" = Minutes
     *      - "h" = Hours
     *      - "d" = Days
     * - example: "20m"
     * - example: "350h"
     */
    config_refresh_token_expiration_time_oauth: process.env.REFRESH_TOKEN_EXPIRATION_TIME_OAUTH ? utilConvertStringToNumberSeconds(process.env.REFRESH_TOKEN_EXPIRATION_TIME_OAUTH) : utilConvertStringToNumberSeconds("30d"),
    /**
     * A config of secret password of "access_token" where to sign JWT via OAuth
     * - .env "ACCESS_TOKEN_SECRET_OAUTH"
     */
    config_access_token_secret_oauth: process.env.ACCESS_TOKEN_SECRET_OAUTH || `NooRat&Dont-Like-toPlay&TheEvilWhanPech`,
    /**
     * A config session lifetime of "JWT" via OAuth
     * - Modifier
     *      - "s" = Seconds
     *      - "m" = Minutes
     *      - "h" = Hours
     *      - "d" = Days
     * - example: "20m"
     * - example: "350h"
     */
    config_access_token_expiration_time_oauth: process.env.ACCESS_TOKEN_EXPIRATION_TIME_OAUTH ? utilConvertStringToNumberSeconds(process.env.ACCESS_TOKEN_EXPIRATION_TIME_OAUTH) : utilConvertStringToNumberSeconds("7d"),

    // Defined of directory where available to save and serve static
    /**
     * A config of lists directory contains assets (path: "src/assets/*")
     * - .env ASSETS_DIRECTORIES_AVAILABLE
     * - each directory split by "," with no whitespace and always lowercase
     * - example: "profiles" (means: create directory path "src/assets/profiles")
     * - example: "profiles,shops" (means: create directory path "src/assets/profiles" and directory path "src/assets/shops")
     */
    config_assets_directories_available: process.env.ASSETS_DIRECTORIES_AVAILABLE || "profiles",

    // Defined prefix of auto increments
    /**
     * A config to set prefix string of run number become one of model "ShopBusinessCustomers" at field "master_customer_code_id"
     * - .env RUN_NUMBER_SHOP_BUSINESS_CUSTOMERS_PREFIX
     * - default: BC
     * @type {string}
     */
    config_run_number_shop_business_customers_prefix: process.env.RUN_NUMBER_SHOP_BUSINESS_CUSTOMERS_PREFIX || "BC",
    /**
     * A config to set prefix string of run number become one of model "ShopBusinessPartners" at field "code_id"
     * - .env RUN_NUMBER_SHOP_BUSINESS_PARTNERS_PREFIX
     * - default: BP
     * @type {string}
     */
    config_run_number_shop_business_partners_prefix: process.env.RUN_NUMBER_SHOP_BUSINESS_PARTNERS_PREFIX || "BP",
    /**
     * A config to set prefix string of run number become one of model "ShopPersonalCustomers" at field "master_customer_code_id"
     * - .env RUN_NUMBER_SHOP_PERSONAL_CUSTOMERS_PREFIX
     * - default: PC
     * @type {string}
     */
    config_run_number_shop_personal_customers_prefix: process.env.RUN_NUMBER_SHOP_PERSONAL_CUSTOMERS_PREFIX || "PC",
    /**
     * A config to set prefix string of run number become one of model "ShopVehicleCustomer" at field "dat_${table_name}_vehicles_customers"
     * - .env RUN_NUMBER_SHOP_VEHICLE_CUSTOMER_PREFIX
     * - default: VC
     * @type {string}
     */
    config_run_number_shop_vehicle_customer_prefix_prefix: process.env.RUN_NUMBER_SHOP_VEHICLE_CUSTOMER_PREFIX || "VC",
    /**
     * A config to set prefix string of run number become one of model "ShopInventoryTransaction" at field "dat_${table_name}_inventory_transaction_doc"
     * - .env RUN_NUMBER_SHOP_INVENTORY_TRANSACTION_PREFIX
     * - default: INI
     * @type {string}
     */
    config_run_number_shop_inventory_transaction_prefix: process.env.RUN_NUMBER_SHOP_INVENTORY_TRANSACTION_PREFIX || "INI",
    /**
     * A config to set prefix string of run number become one of model "ShopInventoryPurchasingPreOrderDoc" at field "dat_${table_name}_inventory_purchasing_pre_order_doc"
     * - .env RUN_NUMBER_SHOP_INVENTORY_PURCHASING_PRE_ORDER_PREFIX
     * - default: PRE
     * @type {string}
     */
    config_run_number_shop_inventory_purchasing_pre_order_prefix: process.env.RUN_NUMBER_SHOP_INVENTORY_PURCHASING_PRE_ORDER_PREFIX || "PRE",
    /**
     * A config to set prefix string of run number become one of model "ShopSalesTransactionDoc" at field "dat_${table_name}_sales_transaction_doc"
     * - .env RUN_NUMBER_SHOP_SALES_QUOTATIONS_PREFIX
     * - default: QUO
     * @type {string}
     */
    config_run_number_shop_sales_quotations_prefix: process.env.RUN_NUMBER_SHOP_SALES_QUOTATIONS_PREFIX || "QUO",
    /**
     * A config to set prefix string of run number become one of model "ShopQuotationDoc" at field "dat_${table_name}_quotation_doc"
     * - .env RUN_NUMBER_SHOP_QUOTATION_PREFIX
     * - default: QU
     * @type {string}
     * @type {string}
     */
    config_run_number_shop_quotation_prefix: process.env.RUN_NUMBER_SHOP_QUOTATION_PREFIX || "QU",
    /**
     * A config to set prefix string of run number become one of model "ShopSalesTransactionDoc" at field "dat_${table_name}_sales_transaction_doc"
     * - .env RUN_NUMBER_SHOP_SALES_ORDER_PREFIX
     * - default: SO
     * @type {string}
     */
    config_run_number_shop_sales_order_prefix: process.env.RUN_NUMBER_SHOP_SALES_ORDER_PREFIX || "SO",
    /**
     * A config to set prefix string of run number become one of model "ShopTemporaryDeliveryOrderDoc" at field "dat_${table_name}_temporary_delivery_order_doc"
     * - .env RUN_NUMBER_SHOP_TEMPORARY_DELIVERY_ORDER_PREFIX
     * - default: TO
     * @type {string}
     */
    config_run_number_shop_temporary_delivery_order_prefix: process.env.RUN_NUMBER_SHOP_TEMPORARY_DELIVERY_ORDER_PREFIX || "TRN",
    /**
     * A config to set prefix string of run number become one of model "VehicleType" at field "master_lookup.mas_vehicle_types"
     * - .env RUN_NUMBER_MASTER_VEHICLE_TYPE_PREFIX
     * - default: VHT
     * @type {string}
     */
    config_run_number_master_vehicle_type_prefix: process.env.RUN_NUMBER_MASTER_VEHICLE_TYPE_PREFIX || "VHT",
    /**
     * A config to set prefix string of run number become one of model "VehicleBrand" at field "master_lookup.mas_vehicles_brands"
     * - .env RUN_NUMBER_MASTER_VEHICLE_BRAND_PREFIX
     * - default: VHB
     * @type {string}
     */
    config_run_number_master_vehicle_brand_prefix: process.env.RUN_NUMBER_MASTER_VEHICLE_BRAND_PREFIX || "VHB",
    /**
     * A config to set prefix string of run number become one of model "BusinessType" at field "master_lookup.mas_business_types"
     * - .env RUN_NUMBER_MASTER_BUSINESS_TYPE_PREFIX
     * - default: BT
     * @type {string}
     */
    config_run_number_master_business_type_prefix: process.env.RUN_NUMBER_MASTER_BUSINESS_TYPE_PREFIX || "BT",
    /**
    * A config to set prefix string of run number become one of model "ProductTypeGroup" at field "master_lookup.mas_product_type_groups"
    * - .env RUN_NUMBER_MASTER_PRODUCT_TYPE_GROUP_PREFIX
    * - default: PTG
     * @type {string}
    */
    config_run_number_master_product_type_group_prefix: process.env.RUN_NUMBER_MASTER_PRODUCT_TYPE_GROUP_PREFIX || "PTG",
    /**
    * A config to set prefix string of run number become one of model "ProductTypeGroup" at field "master_lookup.mas_product_purchase_unit_types"
    * - .env RUN_NUMBER_MASTER_PRODUCT_PURCHASE_UNIT_TYPES_PREFIX
    * - default: PUT
     * @type {string}
    */
    config_run_number_master_product_purchase_unit_types_prefix: process.env.RUN_NUMBER_MASTER_PRODUCT_PURCHASE_UNIT_TYPES_PREFIX || "PUT",
    /**
     * A config to set prefix string of run number become one of model "DocumentTypes" at field "master_lookup.mas_document_types"
     * - .env RUN_NUMBER_MASTER_DOCUMENT_TYPES_PREFIX
     * - default: DT
     * @type {string}
     */
    config_run_number_master_document_types_prefix: process.env.RUN_NUMBER_MASTER_DOCUMENT_TYPES_PREFIX || "DT",
    /**
    * A config to set prefix string of run number become one of model "VehicleColor" at field "master_lookup.mas_vehicle_color"
    * - .env RUN_NUMBER_MASTER_VEHICLE_COLOR_PREFIX
    * - default: VCC
     * @type {string}
    */
    config_run_number_master_vehicle_color_prefix: process.env.RUN_NUMBER_MASTER_VEHICLE_COLOR_PREFIX || "VCC",
    /**
    * A config to set prefix string of run number become one of model "ShopHq" at field "app_datas.dat_shop_hq"
    * - .env RUN_NUMBER_SHOP_HQ_PREFIX
    * - default: HQ
     * @type {string}
    */
    config_run_number_shop_hq_prefix: process.env.RUN_NUMBER_SHOP_HQ_PREFIX || "HQ",
    /**
    * A config to set prefix string of run number become one of model "ShopAppointment" at field "app_datas.dat_shop_appointment"
    * - .env RUN_NUMBER_SHOP_APPOINTMENT_PREFIX
    * - default: APM
     * @type {string}
    */
    config_run_number_shop_appointment_prefix: process.env.RUN_NUMBER_SHOP_APPOINTMENT_PREFIX || "APM",
    /**
     * A config to set prefix string of run number become one of model "ShopQuotationDoc" at field "dat_${table_name}_purchase_order_doc"
     * - .env RUN_NUMBER_SHOP_PURCHASE_ORDER_PREFIX
     * - default: PO
     * @type {string}
     */
    config_run_number_shop_purchase_order_prefix: process.env.RUN_NUMBER_SHOP_PURCHASE_ORDER_PREFIX || "PO",





    //document type
    doc_import: process.env.DOC_IMPORT,     //ใบนำเข้า

    /**
     * A config of clear logs after days
     * - default: 120
     */
    config_app_db_sys_log_clear_after_days: Number.isSafeInteger(Number(process.env.APP_DB_SYS_LOG_CLEAR_ATFER_DAYS)) ? +process.env.APP_DB_SYS_LOG_CLEAR_ATFER_DAYS : 120,


    michelin_api: process.env.MICHELIN_API,
    michelin_brand_id: process.env.MICHELIN_BRAND_ID,

    /**
     * A config of set of object contains status number by session token id
     */
    config_session_types: {
        "access_token": 1,
        "refresh_token": 2,
        "oauth_code": 3
    },

    /**
     * @type {string[]}
     * A config of list document type ids where don't want to modify product stock when using API "ShopSalesOrderPlanLogs"
     * - .env DOCUMENT_TYPE_IDS_NO_MODIFY_PRODUCT_STOCK
     * - each directory split by "," with no whitespace and always lowercase
     * - example: "ea924bbe-28bb-4678-907b-35f22c12516d"
     *   (means: document type id ""ea924bbe-28bb-4678-907b-35f22c12516d" will not modify product stock)
     * - example: "ea924bbe-28bb-4678-907b-35f22c12516d,67c45df3-4f84-45a8-8efc-de22fef31978"
     *   (means: document type id ""ea924bbe-28bb-4678-907b-35f22c12516d" and "67c45df3-4f84-45a8-8efc-de22fef31978" will not modify product stock)
     */
    config_document_type_ids_no_modify_product_stock: process.env.DOCUMENT_TYPE_IDS_NO_MODIFY_PRODUCT_STOCK
        ? process.env.DOCUMENT_TYPE_IDS_NO_MODIFY_PRODUCT_STOCK.split(',').filter(where => isUUID(where))
        : [],

    /**
     * A config Third party API name of WYZAuto Send To WYZ
     */
    config_sys_third_party_api_enable_send_to_wyzauto: String(process.env.SYS_THIRD_PARTY_API_ENABLE_SEND_TO_WYZAUTO || '').toLowerCase() === 'true',
    /**
     * A config Third party API name of WYZAuto
     * - .env SYS_THIRD_PARTY_API_NAME_WYZAUTO
     */
    config_sys_third_party_api_name_wyzauto: process.env.SYS_THIRD_PARTY_API_NAME_WYZAUTO || '',
    /**
     * A config Third party API name of WYZAuto Action: Post-Products
     * - .env SYS_THIRD_PARTY_API_NAME_WYZAUTO_ACTION_POST_PRODUCTS
     */
    config_sys_third_party_api_url_path_wyzauto_action_post_products: process.env.SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_POST_PRODUCTS || '',
    /**
     * A config Third party API name of WYZAuto Action: Get-Products
     * - .env SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_GET_PRODUCTS
     */
    config_sys_third_party_api_url_path_wyzauto_action_get_products: process.env.SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_GET_PRODUCTS || '',
    /**
     * A config Third party API name of WYZAuto Action: Get-BySKU-Product
     * - .env SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_GET_BYSKU_PRODUCT
     */
    config_sys_third_party_api_url_path_wyzauto_action_get_bysku_products: process.env.SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_GET_BYSKU_PRODUCT || '',
    /**
     * A config Third party API name of WYZAuto Action: Disable-All-Products
     * - .env SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_DISABLE_ALL_PRODUCTS
     */
    config_sys_third_party_api_url_path_wyzauto_action_disable_all_products: process.env.SYS_THIRD_PARTY_API_URL_PATH_WYZAUTO_ACTION_DISABLE_ALL_PRODUCTS || '',

    /**
     * A default config of "shop_config" attribute in model "ShopProfile"
     */
    configShopProfile_ShopConfig_DefaultConfig: {
        separate_ShopSalesTransaction_DocType_doc_code: false,
        enable_ShopSalesTransaction_TRN_doc_code: false,
        enable_ShopSalesTransaction_INV_doc_code: false,
        separate_ShopInventoryTransaction_DocType_doc_code: false,
        hide_ShopSalesTransaction_product_coast: false,
        /**
         * Use hook for enable/disable of ShopSalesTransaction From legacy business flows
         */
        enable_ShopSalesTransaction_legacyStyle: false
    },

    /**
    * A config of LINE Login API
    * - LINE Login API Chanel ID
    */
    config_line_login_api_channel_id: process.env.LINE_LOGIN_API_CHANNEL_ID || '',
    /**
     * A config of LINE Login API
     * - LINE Login API Channel Secret
     */
    config_line_login_api_channel_secret: process.env.LINE_LOGIN_API_CHANNEL_SECRET || '',
    /**
     * A config of LINE Login API
     * - LINE Login API Callback Redirect URL
     */
    config_line_login_api_callback_url: process.env.LINE_LOGIN_API_CALLBACK_URL || '',
    /**
     * A config of LINE Login API
     * - LINE Login API Callback Redirect URL WHEN ERROR
     */
    config_line_login_api_callback_url_error: process.env.LINE_LOGIN_API_CALLBACK_URL_ERROR || '',

    /**
     * A config of LINE Message API
     * - LINE API Channel ID
     */
    config_line_message_api_channel_id: process.env.LINE_MESSAGE_API_CHANNEL_ID || '',
    /**
     * A config of LINE Message API
     * - LINE API Channel Secret
     */
    config_line_message_api_channel_secret: process.env.LINE_MESSAGE_API_CHANNEL_SECRET || '',
    /**
     * A config of LINE Message API
     * - LINE API Webhook URL
     */
    config_line_message_api_webhook_url: process.env.LINE_MESSAGE_API_WEBHOOK_URL || '',
    /**
    * A config of LINE channel access token
    * - LINE channel access token
    */
    config_line_channel_access_token: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
}

module.exports = config