const { validationResult } = require("express-validator");
const BookModel = require("../model/Book");
const DiscountModel = require("../model/Discount");
const moment = require('moment');
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const logger = require("../middleware/logger");
let logEntry;


class Discount {
    async addDiscount(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Invalid properties", validation));
            }
            let { book, discountPercentage, discountFrom, discountExp } = req.body;
            let bookRequested = await BookModel.findOne({ _id: book });
            if (!bookRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("Book does not exist"));
            }

            const existingDiscount = await DiscountModel.findOne({
                book: book,
            });
            if (existingDiscount) {
                await DiscountModel.findByIdAndDelete({
                    _id: existingDiscount._id,
                });
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
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Successfully added discount", data));
                })
                .catch((err) => {
                    console.log(err);
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                        .send(failure("Failed to add discount"));
                });

        } catch (error) {
            console.log(error);
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-discount"));
        }
    }



}


module.exports = new Discount();