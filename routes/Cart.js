const express = require("express");
const routes = express();
const CartController = require("../controller/CartController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");



routes.post('/add-to-cart', authValidation.isAuthorized, authValidation.isCustomer, expressValidation.cart, CartController.addToCart);
routes.put('/remove-from-cart', authValidation.isAuthorized, authValidation.isCustomer, expressValidation.cart, CartController.removeFromCart);
routes.post('/checkout-cart', authValidation.isAuthorized, authValidation.isCustomer, expressValidation.checkoutCart, CartController.checkoutCart);
routes.get("/cart/:userId", authValidation.isAuthorized, authValidation.isCustomer, CartController.getCart);


module.exports = routes;