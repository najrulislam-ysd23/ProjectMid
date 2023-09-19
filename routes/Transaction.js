const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.get("/all", authValidation.isAuthorized, authValidation.isAdmin, TransactionController.getAll);
routes.get("/:id", authValidation.isAuthorized, authValidation.isCustomer, TransactionController.getById);


module.exports = routes;