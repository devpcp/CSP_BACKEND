const _ = require("lodash");
const { isUUID } = require("./generate");
const moment = require("moment");
const { Op } = require("sequelize");
const ShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;


/**
 * It takes a vehicle customer id, and returns the average mileage of the vehicle customer
 * @param {string} table_name - The shop_id of the shop code.
 * @param {string} vehicles_customers_id - This is the id of the vehicle customer.
 * @param {number} current_mileage - The current mileage of the vehicle
 * @param {object} options - An optional configurations
 * @param  {typeof import("sequelize").Transaction} options.transaction - Attachable Sequelize Transaction
 * @returns {Promise<number>} The average mileage of a vehicle.
 */
const utilGetAverageVehicleCustomerMileage = async (table_name = "", vehicles_customers_id = "", current_mileage = 0, options = {}) => {
    if (!isUUID(vehicles_customers_id)) {
        throw Error('vehicles_customers_id is not uuid');
    }
    else {
        /**
         * @type {typeof import("sequelize").Transaction | null}
         */
        const transaction = _.get(options, 'transaction', null);

        const modelShopSalesTransactionDoc = ShopSalesTransactionDoc(table_name);

        const findShopVehicleCustomerById = await modelShopSalesTransactionDoc.findOne({
            where: {
                vehicles_customers_id: vehicles_customers_id,
                 status: {
                    [Op.ne]: 0
                 }
            },
            order: [
                ['created_date', 'desc']
            ],
            transaction: transaction
        });

        if (!findShopVehicleCustomerById) {
            return current_mileage;
        }
        else {
            const mileageFormDocument = Number(_.get(findShopVehicleCustomerById, 'details.mileage', 0));

            if (!_.isFinite(mileageFormDocument)) {
                throw Error(`details.mileage in document is not number`);
            }
            else {
                const currentDate = moment();
                const createdDocumentDate = moment(findShopVehicleCustomerById.created_date);
                /**
                 * Checking if the difference between the current date and the created date is 0, if it is 0, it will
                 * return 1, else it will return the difference between the current date and the created date.
                 * @type {number}
                 */
                const diffDateOfCreatedDocAndCurrentDate = currentDate.diff(createdDocumentDate, 'days') === 0
                    ? 1
                    : currentDate.diff(createdDocumentDate, 'days');

                /**
                 * Calculating the average mileage of the vehicle.
                 * @type {number}
                 */
                const calculateAverageMileage = Math.abs(current_mileage - mileageFormDocument) / diffDateOfCreatedDocAndCurrentDate;

                // กรณีที่ เลขไมล์ปัจจุบันนั้นตำกว่าของก่อนหน้า ให้เอาเลขไมล์ปัจจุบัน เลย
                return current_mileage < mileageFormDocument ? current_mileage : calculateAverageMileage;
            }
        }
    }
};


module.exports = utilGetAverageVehicleCustomerMileage;