const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.get("/all-transaction", authValidation.isAuthorized, authValidation.isAdmin, TransactionController.getAll);
routes.get("/transaction/:id", authValidation.isAuthorized, authValidation.isCustomer, TransactionController.getById);


module.exports = routes;