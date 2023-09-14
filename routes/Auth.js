const express = require("express");
const routes = express();
const AuthController = require("../controller/AuthController");
const expressValidation = require("../middleware/ExpressValidator");
const limiter = require("../middleware/Limiter");




routes.post('/signup', expressValidation.signup, AuthController.signup);
routes.post('/login', limiter, expressValidation.login, AuthController.login);



module.exports = routes;