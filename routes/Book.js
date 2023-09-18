const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.post('/add', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.createBook, BookController.addBook);
routes.get("/all", authValidation.isAuthorized, BookController.getBooks);
routes.get('/book/:id', BookController.getOneBook);
routes.post('/add-discount', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.addDiscount, BookController.addDiscount);





module.exports = routes;