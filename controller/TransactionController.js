const { validationResult } = require("express-validator");
const TransactionModel = require("../model/Transaction");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const logger = require("../middleware/logger");
let logEntry;

class Transaction {
    async getAll(req, res) {
        try {
            const { user, page, limit } = req.query;
            const defaultPage = 1;
            const defaultLimit = 10;

            let skipValue = (defaultPage - 1) * defaultLimit;
            let pageNumber = defaultPage;
            if (page > 0 && limit > 0) {
                skipValue = (page - 1) * limit;
                pageNumber = page;
            } else {
                if (page > 0) { // only page given
                    skipValue = (page - 1) * defaultLimit;
                    pageNumber = page;
                } else if (limit > 0) { // only limit given
                    skipValue = (defaultPage - 1) * limit;
                }
            }
            let queryObject = {}; 
            if(user) {
                const userRequested = await UserModel.findById({ _id: user});
                if (!userRequested) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.NOT_FOUND).send(failure("User does not exist"));
                }
                queryObject.user = user;
            }
            
            console.log(queryObject);
            const transactions = await TransactionModel.find( queryObject )
                .populate("books.book", "bookName rating")
                .populate("user", "name")
                .sort({ "createdAt": -1 })
                .skip(skipValue)
                .limit(limit || defaultLimit);
            console.log(transactions);
            if (transactions.length > 0) {
                logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(
                    success("Successfully got all the transactions", {
                        pageNo: Number(pageNumber),
                        limit: Number(limit),
                        transactions,
                        total: transactions.length,
                    })
                );
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(success("No transactions were found"));
            }
        } catch (error) {
            console.log(error);
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while getting all transaction for a user"));
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await TransactionModel.findOne({ _id: id })
                .populate("user", "name")
                .populate("books.book", "bookName rating");
            console.log(transaction);

            if (!transaction) {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Transaction does not exist"));
            }
            logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.OK).send(success("Successfully got the transaction", transaction));
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while getting transaction"));
        }
    }

}

module.exports = new Transaction();
