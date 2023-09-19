const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");
const DiscountCountroller = require("../controller/DiscountCountroller");


routes.post('/add-discount', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.addDiscount, DiscountCountroller.addDiscount);



module.exports = routes;