const express = require("express");
const routes = express();
const CartController = require("../controller/CartController");
const expressValidation = require("../middleware/ExpressValidator");


routes.post('/add-to-cart', expressValidation.cart, CartController.addToCart);
routes.put('/remove-from-cart', expressValidation.cart, CartController.removeFromCart);
routes.post('/checkout-cart', expressValidation.checkoutCart, CartController.checkoutCart);
// routes.get("/all", CartController.getAll);


module.exports = routes;