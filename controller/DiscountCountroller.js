const { validationResult } = require("express-validator");
const BookModel = require("../model/Book");
const DiscountModel = require("../model/Discount");
const moment = require('moment');
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");


class Discount {
    async addDiscount(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Invalid properties", validation));
            }
            let { book, discountPercentage, discountFrom, discountExp } = req.body;
            let bookRequested = await BookModel.findOne({ _id: book });
            if (!bookRequested) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("Book does not exist"));
            }
            if (!discountFrom) {
                discountFrom = moment(new Date()).format('DD-MM-YY HH:mm:ss');
            }
            const discountData = new DiscountModel({
                book,
                discountPercentage,
                discountFrom,
                discountExp,
            });
            await discountData
                .save()
                .then((data) => {
                    console.log(data);
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Successfully added discount", data));
                })
                .catch((err) => {
                    console.log(err);
                    return res
                        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                        .send(failure("Failed to add discount"));
                });

        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-discount"));
        }
    }



}


module.exports = new Discount();