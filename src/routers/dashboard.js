const {
    config, brandSales, dailyInfo, compareMonthlySales
    , compareSalesTarget, numberOfUserThisMonth, typeSales
    , dailyFinanceInfo, brandSalesOnlyTire, brandSalesOnlySpare
    , numberOfIncomeThisMonth
    , numberOfSalesTireAmountByDateRange, compareYearlySalesTireAmount, numberOfSalesTireAmountByMonth, numberOfSalesSpareAmountByMonth,
    compareYearlySalesSpareAmount, topSizeSales, topType, topCustomer
} = require('../handlers/dashboard')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { config_, brand_sales, daily_info, compare_monthly_sales
    , compare_sales_target, number_of_user_this_month, type_sales, daialy_finance_info, number_of_income_this_month
    , number_of_sales_tire_amount_by_date_range, compare_yearly_sales_tire_amount, number_of_sales_tire_amount_by_month, number_of_sales_spare_amount_by_month, compare_yearly_sales_spare_amount
    , top_size_sales,
    top_customer,
    top_type
} = require('../models/Dashboard/schema')
const DashboardRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/config",
        schema: config_,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: config
    })


    app.route({
        method: "GET",
        url: "/brandSales",
        schema: brand_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: brandSales
    })

    app.route({
        method: "GET",
        url: "/brandSalesOnlyTire",
        schema: brand_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: brandSalesOnlyTire
    })

    app.route({
        method: "GET",
        url: "/brandSalesOnlySpare",
        schema: brand_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: brandSalesOnlySpare
    })

    app.route({
        method: "GET",
        url: "/dailyInfo",
        schema: daily_info,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: dailyInfo
    })
    app.route({
        method: "GET",
        url: "/compareMonthlySales",
        schema: compare_monthly_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: compareMonthlySales
    })
    app.route({
        method: "GET",
        url: "/compareSalesTarget",
        schema: compare_sales_target,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: compareSalesTarget
    })
    app.route({
        method: "GET",
        url: "/numberOfUserThisMonth",
        schema: number_of_user_this_month,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: numberOfUserThisMonth
    })

    app.route({
        method: "GET",
        url: "/typeSales",
        schema: type_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: typeSales
    })
    app.route({
        method: "GET",
        url: "/dailyFinanceInfo",
        schema: daialy_finance_info,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: dailyFinanceInfo
    })

    app.route({
        method: "GET",
        url: "/numberOfIncomeThisMonth",
        schema: number_of_income_this_month,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: numberOfIncomeThisMonth
    })

    app.route({
        method: "GET",
        url: "/numberOfSalesTireAmountByDateRange",
        schema: number_of_sales_tire_amount_by_date_range,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: numberOfSalesTireAmountByDateRange
    });

    app.route({
        method: "GET",
        url: "/compareYearlySalesTireAmount",
        schema: compare_yearly_sales_tire_amount,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: compareYearlySalesTireAmount
    });

    app.route({
        method: "GET",
        url: "/compareYearlySalesSpareAmount",
        schema: compare_yearly_sales_spare_amount,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: compareYearlySalesSpareAmount
    });

    app.route({
        method: "GET",
        url: "/numberOfSalesTireAmountByMonth",
        schema: number_of_sales_tire_amount_by_month,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: numberOfSalesTireAmountByMonth
    });

    app.route({
        method: "GET",
        url: "/numberOfSalesSpareAmountByMonth",
        schema: number_of_sales_spare_amount_by_month,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: numberOfSalesSpareAmountByMonth
    });

    app.route({
        method: "GET",
        url: "/topSizeSales",
        schema: top_size_sales,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: topSizeSales
    })

    app.route({
        method: "GET",
        url: "/topType/:which",
        schema: top_type,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: topType
    })
    app.route({
        method: "GET",
        url: "/topCustomer",
        schema: top_customer,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: topCustomer
    })
}

module.exports = DashboardRouters 