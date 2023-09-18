const { validationResult } = require("express-validator");
const BookModel = require("../model/Book");
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

            const { id, bookName, description, author, genre, price, stock } = req.body;
            let updateObject = {};

            let userRequested = await BookModel.findOne({ _id: id });
            if (!userRequested) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("User does not exist"));
            }
            if (name || age || area || city || country) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("You can only update role or verify an user"));
                // return res.status(HTTP_STATUS.NOT_MODIFIED).send(failure("You can only update role or verify an user"));
            }
            if (role) {
                updateObject.role = role;
            }
            if (verified) {
                updateObject.verified = verified;
            }
            if (!role && !verified) {
                return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide valid property/s to update role or verify user"));
            }

            // console.log(updateObject);
            // user = await AuthModel.updateOne(
            //     { email: email },
            //     { $set: updateObject }
            // );

            // const { email } = req.body;
            // if (email) {
            //     return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Invalid properties"));
            // }
            // if (!name && !age && !area && !city && !country && !cashIn && !cashOut) {
            //     return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide valid property/s to update"));
            // }
            // if (name) {
            //     updateObject.name = name;
            // }
            // if (age) {
            //     updateObject.age = age;
            // }
            // if (area) {
            //     updateObject.address.area = area;
            // }
            // if (city) {
            //     updateObject.address.city = city;
            // }
            // if (country) {
            //     updateObject.address.country = country;
            // }
            // let userRequested = await UserModel.findOne({ email: decoded.email });
            // if(cashIn && cashOut) {
            //     return res
            //             .status(HTTP_STATUS.NOT_ACCEPTABLE)
            //             .send(failure("You can not request for both cashIn and cashOut"));
            // } else if (cashIn) {
            //     const newBalance = userRequested.balance+cashIn;
            //     if(cashIn<=50000){
            //         updateObject.balance = newBalance;
            //     } else {
            //         return res
            //             .status(HTTP_STATUS.NOT_ACCEPTABLE)
            //             .send(failure("You can not cash-in more than 50000 at once"));
            //     }
            // } else if (cashOut) {
            //     const newBalance = userRequested.balance-cashOut;
            //     if(newBalance>=100){
            //         updateObject.balance = newBalance;
            //     } else {
            //         return res
            //             .status(HTTP_STATUS.NOT_ACCEPTABLE)
            //             .send(failure(`You can not cash-out more than ${userRequested.balance-100}`));
            //     }
            // }
            // user = await UserModel.updateOne(
            //     { email: decoded.email },
            //     { $set: updateObject }
            // );

            if (user) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully updated the user", user));
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Failed to update the user"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error while updating user"));
        }
    }


    async addDiscount(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            // const {name, email, role, personal_info{age, address}} = req.body;
            const { id, discountPercentage, discountFrom, discountTill } = req.body;
            const discountObject = {};
            discount.discountPercentage = discountPercentage;
            discount.discountFrom = discountFrom;
            discount.discountTill = discountTill;

            const book = await BookModel.findOneAndUpdate(
                { _id: id },
                { $set: discountObject }
            );
            if (book) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully added discount to the book", user));
            } else {
                return res.status(HTTP_STATUS.NOT_MODIFIED).send(failure("Failed to add discount to the book"));
            }

        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-discount"));
        }
    }


}

module.exports = new Book();