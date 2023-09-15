const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.post('/add', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.createBook, BookController.addBook);
routes.get("/all", authValidation.isAuthorized, BookController.getAll);
routes.get('/book/:id', BookController.getById);




module.exports = routes;