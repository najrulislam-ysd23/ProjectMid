const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.get("/all-user", authValidation.isAuthorized, authValidation.isAdmin, expressValidation.getUsersQuery, UserController.getUsers);
routes.get("/user/:id", authValidation.isAuthorized, UserController.getOneUser);
routes.patch('/update-user', authValidation.isAuthorized, UserController.updateUser);
routes.delete('/delete-user', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.isValidEmail, UserController.deleteUser);



module.exports = routes;