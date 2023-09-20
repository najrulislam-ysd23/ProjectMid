const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");


routes.post('/add-book', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.createBook, BookController.addBook);
routes.get("/all-book", authValidation.isAuthorized, expressValidation.booksQuery, BookController.getBooks);
routes.get('/book/:id', authValidation.isAuthorized, BookController.getOneBook);
// routes.patch('/book/add-discount', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.addDiscount, BookController.addDiscount);
routes.patch('/update-book', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.updateBook, BookController.updateBook);
routes.delete('/delete-book', authValidation.isAuthorized, authValidation.isAdmin, expressValidation.isValidBook, BookController.deleteBook);




module.exports = routes;