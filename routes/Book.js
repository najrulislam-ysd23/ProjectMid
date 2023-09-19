const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.post('/add', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.createBook, BookController.addBook);
routes.get("/all", authValidation.isAuthorized, BookController.getBooks);
routes.get('/book/:id', BookController.getOneBook);
// routes.patch('/book/add-discount', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.addDiscount, BookController.addDiscount);
routes.patch('/book/update', authValidation.isAuthorized, authValidation.isAdmin, BookController.updateBook);
routes.delete('/book/delete', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.isValidBook, BookController.deleteBook);




module.exports = routes;