const { validationResult } = require("express-validator");
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
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            // const {name, email, role, personal_info{age, address}} = req.body;
            const { bookId, discountPercentage, discountFrom, discountTill } = req.body;
            let bookRequested = await BookModel.findOne({ _id: bookId });
            if (!bookRequested) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("Book does not exist"));
            }
            bookRequested.discountPercentage = discountPercentage;
            if (discountFrom) {
                bookRequested.discountFrom = discountFrom;
            } else {
                bookRequested.discountFrom = moment(new Date()).format('DD-MM-YY HH:mm:ss');
            }
            bookRequested.discountTill = discountTill;
            console.log(bookRequested);
            await bookRequested
                .save()
                .then((data) => {
                    return res.status(HTTP_STATUS.OK).send(success("Successfully added discount to the book", bookRequested));
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(HTTP_STATUS.NOT_MODIFIED).send(failure("Failed to add discount to the book"));
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