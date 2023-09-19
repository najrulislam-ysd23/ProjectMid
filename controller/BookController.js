const { validationResult } = require("express-validator");
const BookModel = require("../model/Book");
const moment = require('moment');
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class Book {
    async getBooks(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Invalid property input", validation));
            }

            let { page, limit, bookName, description, price, priceCriteria, rating, ratingCriteria, stock, stockCriteria, discountPercentage, discountCriteria, author, genre, search, sortParam, sortOrder } = req.query;

            const defaultPage = 1;
            const defaultLimit = 10;

            let skipValue = (defaultPage - 1) * defaultLimit;
            let pageNumber = defaultPage;
            if (page > 0 && limit > 0) {
                skipValue = (page - 1) * limit;
                pageNumber = page;
            } else {
                if (page > 0) { // only page given
                    skipValue = (page - 1) * defaultLimit;
                    pageNumber = page;
                } else if (limit > 0) { // only limit given
                    skipValue = (defaultPage - 1) * limit;
                }
            }


            // console.log(sortParam);
            let sortingOrder = -1; // default descending by creation time i.e. recent uploaded products
            if (sortOrder === "asc") {
                sortingOrder = 1;
            }
            let sortObject = {};
            if (sortParam) {
                sortObject = { [`${sortParam}`]: sortingOrder };
            } else if (!sortParam) {
                sortObject = { "createdAt": sortingOrder };
            }
            // console.log(sortObject);

            let queryObject = {}; // filter object

            if (author) {

                queryObject.author = { $regex: author, $options: "i" };
            }

            if (genre) {
                queryObject.genre = genre.toLowerCase();
            }

            if (price && priceCriteria) {
                queryObject.price = { [`$${priceCriteria}`]: price };
            } else if (priceCriteria && !price) {
                return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid request for filtering price"));
            } else if (price && !priceCriteria) {
                queryObject.price = { $eq: price };
            }

            if (rating && ratingCriteria) {
                queryObject.rating = { [`$${ratingCriteria}`]: rating };
            } else if (ratingCriteria && !rating) {
                return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid request for filter by rating"));
            } else if (rating && !ratingCriteria) {
                queryObject.rating = { $eq: rating };
            }

            // if (discountPercentage && discountCriteria) {
            //     queryObject.discountPercentage = { [`$${discountCriteria}`]: discountPercentage };
            // } else if (discountCriteria && !discountPercentage) {
            //     return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid request for filter by rating"));
            // } else if (discountPercentage && !discountCriteria) {
            //     queryObject.discountPercentage = { $eq: discountPercentage };
            // }

            if (stock && stockCriteria) {
                queryObject.stock = { [`$${stockCriteria}`]: stock };
            } else if (stockCriteria && !stock) {
                return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid request for filter by stock"));
            } else if (stock && !stockCriteria) {
                queryObject.stock = { $eq: stock };
            }

            console.log(queryObject);

            if (!search) {
                search = "";
            }

            const pageBooks = await BookModel.find(queryObject)
                .or([
                    { bookName: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ])
                .sort(sortObject)
                .skip(skipValue)
                .limit(limit || defaultLimit);
            if (pageBooks.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No books to show"));
            }
            const totalBooks = (await BookModel.find({})).length;
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success("Successfully got the books", {
                        total: totalBooks,
                        pageNo: Number(pageNumber),
                        limit: Number(limit),
                        countPerPage: pageBooks.length,
                        books: pageBooks,
                    })
                );
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }

    async getOneBook(req, res) {
        try {
            const id = req.params.id;
            const book = await BookModel.findById({ _id: id });
            if (book) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Successfully received the book", book));
            } else {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to received the book"));
            }
        } catch (error) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from getById"));
        }
    }

    // using express-validator
    async addBook(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            } else {
                // const {name, email, role, personal_info{age, address}} = req.body;
                const { bookISBN, bookName, description, author, genre, price, stock } = req.body;
                // genre = genre.toLowerCase();
                const book = new BookModel({
                    bookISBN,
                    bookName,
                    description,
                    author,
                    genre,
                    price,
                    stock,
                });
                const existingBook = await BookModel.findOne({ bookISBN: bookISBN });
                if (existingBook) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book already exists"));
                }
                await book
                    .save()
                    .then((data) => {
                        return res
                            .status(HTTP_STATUS.OK)
                            .send(success("Successfully added the book", data));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                            .send(failure("Failed to add the book"));
                    });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add"));
        }
    }

    async updateBook(req, res) {
        try {
            console.log("executing updateBook");

            const { id, bookName, description, author, genre, price, stockInc, stockDec } = req.body;
            let updateObject = {};

            let bookRequested = await BookModel.findOne({ _id: id });
            if (!bookRequested) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("Book does not exist"));
            }
            if (!bookName && !description && !author && !genre && !price && !stockInc && stockDec) {
                return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide valid property/s to update book"));
            }
            if (bookName) {
                updateObject.bookName = bookName;
            }
            if (description) {
                updateObject.description = description;
            }
            if (author) {
                updateObject.author = author;
            }
            if (genre) {
                updateObject.genre = genre;
            }
            if (price) {
                console.log(price);
                if(price<=0){
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(failure("Price can not be zero"));
                }
                updateObject.price = price;
            }
            
            if (stockInc && stockDec) {
                return res
                    .status(HTTP_STATUS.NOT_ACCEPTABLE)
                    .send(failure("You can not request for both stockInc and stockDec"));
            } else if (stockInc) {
                const newStock = bookRequested.stock + stockInc;
                if (stockInc <= 100) {
                    updateObject.stock = newStock;
                } else {
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("You can not increment stock more than 100 at once"));
                }
            } else if (stockDec) {
                const newStock = bookRequested.stock - stockDec;
                if (newBalance >= 0) {
                    updateObject.stock = newStock;
                } else {
                    updateObject.stock = 0;
                }
            }

            console.log(updateObject);
            const updatedBook = await BookModel.updateOne(
                { _id: id },
                { $set: updateObject }
            );
            console.log(updatedBook);
            if (updatedBook) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully updated the book", updatedBook));
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Failed to update the book"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error while updating book"));
        }
    }


    


}

module.exports = new Book();