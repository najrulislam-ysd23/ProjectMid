const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.get("/all", authValidation.isAuthorized, authValidation.isAdmin, expressValidation.getUsersQuery, UserController.getUsers);
routes.patch('/user/update', authValidation.isAuthorized, UserController.updateUser);
routes.delete('/user/delete', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.isValidEmail, UserController.deleteUser);



module.exports = routes;