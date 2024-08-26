const toCurrency = require("../utils/util.toCurrency");

describe(`Function Test: validatePriceGrandTotal`, () => {
    const validatePriceGrandTotal = async (instance, options) => {
        /**
         * ประเภทภาษีมูลค่าเพิ่ม
         * * 1 = รวมภาษีมูลค่าเพิ่ม
         * * 2 = ไม่รวมภาษีมูลค่าเพิ่ม
         * * 3 = ไม่คิดภาษีมูลค่าเพิ่ม
         * @type {1|2|3}
         */
        const vat_type = instance.vat_type
        /**
         * อัตราภาษีมูลค่าเพิ่ม
         * @type {number}
         */
        const vat_value = instance.vat_value
        /**
         * ส่วนลดท้ายบิล
         */
        const price_discount_bill = toCurrency(instance.price_discount_bill);
        /**
         * รวมเป็นเงิน
         */
        const price_sub_total = toCurrency(instance.price_sub_total);
        /**
         * ส่วนลดรวม
         */
        const price_discount_total = toCurrency(instance.price_discount_total);
        /**
         * ราคาหลังหักส่วนลด
         */
        const price_amount_total = toCurrency(instance.price_amount_total);
        /**
         * ราคาก่อนรวมภาษี
         */
        const price_before_vat = toCurrency(instance.price_before_vat);
        /**
         * ภาษีมูลค่าเพิ่ม
         */
        const price_vat = toCurrency(instance.price_vat);
        /**
         * จำนวนเงินรวมทั้งสิ้น
         */
        const price_grand_total = toCurrency(instance.price_grand_total);

        /**
         * ผลรวมของราคาทั้งหมดจากแหล่งต่าง ๆ โดยยังไม่เอาส่วนลดมาเกี่ยวข้อง
         */
        const resultOfPriceSubTotal = price_sub_total;
        // ตรวจสอบผลรวมราคาทั้งหมดว่าซื้อมาเท่าไหร่โดยยังไม่คำนึงถึงส่วนลด
        if (price_sub_total.value !== resultOfPriceSubTotal.value) {
            throw Error('Variable "price_sub_total" of model ShopPurchaseOrderDoc must equal all discount in this ShopPurchaseOrderDoc document and ShopPurchaseOrderList documents');
        }

        /**
         * ผลรวมของราคาส่วนลดจากแหล่งต่าง ๆ
         */
        const resultOfPriceDiscountTotal = price_discount_bill;
        // ตรวจสอบผลรวมลดราคาทั้งหมดว่าลดเท่าไหร่
        if (price_discount_total.value !== resultOfPriceDiscountTotal.value) {
            throw Error('Variable "price_discount_total" of model ShopPurchaseOrderDoc must equal all discount in this ShopPurchaseOrderDoc document and ShopPurchaseOrderList documents');
        }

        /**
         * ผลรวมราคาหลังหักส่วนลด
         */
        const resultOfPriceAmountTotal = resultOfPriceSubTotal.subtract(resultOfPriceDiscountTotal).value  > 0
            ? resultOfPriceSubTotal.subtract(resultOfPriceDiscountTotal)
            : toCurrency(0);
        // ตรวจสอบผลรวมราคาหลังหักส่วนลด หากส่วนลดทั้งมีค่าเยอะกว่าราคาซือที่ยังไม่ได้เกี่ยวข้อกับส่วนลด ผลรวมราคาหลังหักส่วนลดจะต้องมีค่าเป็น 0 เสมอ
        if (resultOfPriceAmountTotal.value < 0) {
            if (price_amount_total.value !== 0) {
                throw Error('Variable "price_amount_total" of model ShopPurchaseOrderDoc require must be 0, due from over discount');
            }
        }
        else {
            if (price_amount_total.value !== resultOfPriceAmountTotal.value) {
                throw Error('Variable "price_amount_total" of model ShopPurchaseOrderDoc must equal all discount in this ShopPurchaseOrderDoc document and ShopPurchaseOrderList documents');
            }
        }

        switch (vat_type) {
            // รวมภาษีมูลค่าเพิ่ม ราคาของฟิวส์ "ราคาก่อนรวมภาษี" จะต้องน้อยกว่าหรือเท่ากับ 0 ของฟิวส์ "ราคาหลังหักส่วนลด"
            case 1: {
                /**
                 * ภาษีมูลค่าเพิ่ม
                 */
                const resultOfPriceVat = resultOfPriceAmountTotal.multiply((vat_value / (100 + vat_value)));
                /**
                 * ราคาก่อนรวมภาษี
                 */
                const resultOfPriceBeforeVat = resultOfPriceAmountTotal.subtract(resultOfPriceVat);
                const resultOfPriceGrandTotal = resultOfPriceVat.add(resultOfPriceBeforeVat);
                // Validate: รวมเป็นเงิน
                if (resultOfPriceSubTotal.value !== price_sub_total.value) {
                    throw Error('Variable "price_sub_total" is unexpected');
                }
                // Validate: ส่วนลดรวม
                if (resultOfPriceDiscountTotal.value !== price_discount_total.value) {
                    throw Error('Variable "price_discount_total" is unexpected');
                }
                // Validate: ราคาหลังหักส่วนลด
                if (resultOfPriceAmountTotal.value !== price_amount_total.value) {
                    throw Error('Variable "price_amount_total" is unexpected');
                }
                // Validate: ราคาก่อนรวมภาษี
                if (resultOfPriceBeforeVat.value !== price_before_vat.value) {
                    throw Error('Variable "price_before_vat" is unexpected');
                }
                // Validate: ภาษีมูลค่าเพิ่ม
                if (resultOfPriceVat.value !== price_vat.value) {
                    throw Error('Variable "price_vat" is unexpected');
                }
                // Validate: จำนวนเงินรวมทั้งสิ้น
                if (resultOfPriceGrandTotal.value !== price_grand_total.value) {
                    throw Error('Variable "price_grand_total" is unexpected');
                }
                const result = {
                    vat_type: vat_type, // ประเภทภาษีมูลค่าเพิ่ม
                    vat_value: vat_value, // อัตราภาษีมูลค่าเพิ่ม
                    price_discount_bill: price_discount_bill.value, // ส่วนลดท้ายบิล
                    price_sub_total: resultOfPriceSubTotal.value, // รวมเป็นเงิน
                    price_discount_total: resultOfPriceDiscountTotal.value, // ส่วนลดรวม
                    price_amount_total: resultOfPriceAmountTotal.value, // ราคาหลังหักส่วนลด
                    price_before_vat: resultOfPriceBeforeVat.value, // ราคาก่อนรวมภาษี
                    price_vat: resultOfPriceVat.value, // ภาษีมูลค่าเพิ่ม
                    price_grand_total: resultOfPriceGrandTotal.value // จำนวนเงินรวมทั้งสิ้น
                };
                return result;
            }
            case 2: {
                break;
            }
            case 3: {
                break;
            }
            default: {
                throw Error('Variable "vat_type" of model ShopPurchaseOrderDoc require Number type of some of 1,2,3');
            }
        }
    };

    test('Case 1: Normal price', async () => {
        const instance = {
            vat_type: 1, // ประเภทภาษีมูลค่าเพิ่ม
            vat_value: 7, // อัตราภาษีมูลค่าเพิ่ม
            price_discount_bill: 100, // ส่วนลดท้ายบิล
            price_sub_total: 6000, // รวมเป็นเงิน
            price_discount_total: 100, // ส่วนลดรวม
            price_amount_total: 5900, // ราคาหลังหักส่วนลด
            price_before_vat: 5514.02, // ราคาก่อนรวมภาษี
            price_vat: 385.98, // ภาษีมูลค่าเพิ่ม
            price_grand_total: 5900 // จำนวนเงินรวมทั้งสิ้น
        };
        const expectInstance = {
            vat_type: 1, // ประเภทภาษีมูลค่าเพิ่ม
            vat_value: 7, // อัตราภาษีมูลค่าเพิ่ม
            price_discount_bill: 100, // ส่วนลดท้ายบิล
            price_sub_total: 6000, // รวมเป็นเงิน
            price_discount_total: 100, // ส่วนลดรวม
            price_amount_total: 5900, // ราคาหลังหักส่วนลด
            price_before_vat: 5514.02, // ราคาก่อนรวมภาษี
            price_vat: 385.98, // ภาษีมูลค่าเพิ่ม
            price_grand_total: 5900 // จำนวนเงินรวมทั้งสิ้น
        };
        await expect(validatePriceGrandTotal(instance, {}))
            .resolves
            .toEqual(expectInstance)
    });

    test('Case 2: Zero price', async () => {
        const instance = {
            vat_type: 1, // ประเภทภาษีมูลค่าเพิ่ม
            vat_value: 7, // อัตราภาษีมูลค่าเพิ่ม
            price_discount_bill: 0, // ส่วนลดท้ายบิล
            price_sub_total: 0, // รวมเป็นเงิน
            price_discount_total: 0, // ส่วนลดรวม
            price_amount_total: 0, // ราคาหลังหักส่วนลด
            price_before_vat: 0, // ราคาก่อนรวมภาษี
            price_vat: 0, // ภาษีมูลค่าเพิ่ม
            price_grand_total: 0 // จำนวนเงินรวมทั้งสิ้น
        };
        const expectInstance = {
            vat_type: 1, // ประเภทภาษีมูลค่าเพิ่ม
            vat_value: 7, // อัตราภาษีมูลค่าเพิ่ม
            price_discount_bill: 0, // ส่วนลดท้ายบิล
            price_sub_total: 0, // รวมเป็นเงิน
            price_discount_total: 0, // ส่วนลดรวม
            price_amount_total: 0, // ราคาหลังหักส่วนลด
            price_before_vat: 0, // ราคาก่อนรวมภาษี
            price_vat: 0, // ภาษีมูลค่าเพิ่ม
            price_grand_total: 0 // จำนวนเงินรวมทั้งสิ้น
        };
        await expect(validatePriceGrandTotal(instance, {}))
            .resolves
            .toEqual(expectInstance)
    });

    test('Case 3: Minus price', async () => {
        const instance = {
            vat_type: 1, // ประเภทภาษีมูลค่าเพิ่ม
            vat_value: 7, // อัตราภาษีมูลค่าเพิ่ม
            price_discount_bill: -1, // ส่วนลดท้ายบิล
            price_sub_total: 0, // รวมเป็นเงิน
            price_discount_total: 0, // ส่วนลดรวม
            price_amount_total: 0, // ราคาหลังหักส่วนลด
            price_before_vat: 0, // ราคาก่อนรวมภาษี
            price_vat: 0, // ภาษีมูลค่าเพิ่ม
            price_grand_total: 0 // จำนวนเงินรวมทั้งสิ้น
        };
        await expect(validatePriceGrandTotal(instance, {}))
            .rejects
            .toThrow('Variable "price_discount_total" of model ShopPurchaseOrderDoc must equal all discount in this ShopPurchaseOrderDoc document and ShopPurchaseOrderList documents')
    });
})