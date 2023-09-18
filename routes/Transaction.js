const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const expressValidation = require("../middleware/ExpressValidator");


// routes.post('/add', expressValidation.createOrder, OrderController.addProduct);
routes.get("/all", TransactionController.getAll);
routes.get('/transaction/:id', TransactionController.getById);



module.exports = routes;