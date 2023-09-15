const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.get("/all", authValidation.isAuthorized, authValidation.isAdmin, UserController.getAll);
routes.get('/user/:id', authValidation.isAuthorized, authValidation.isAdmin, UserController.getById);

// routes.delete('/delete/:id', ProductController.deleteById);
// routes.patch('/update', ProductValidation.updateValidation, ProductController.updateById);



module.exports = routes;