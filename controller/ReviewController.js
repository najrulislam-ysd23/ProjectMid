const { validationResult } = require("express-validator");
const ReviewModel = require("../model/Review");
const UserModel = require("../model/User");
const BookModel = require("../model/Book");
const TransactionModel = require("../model/Transaction");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const logger = require("../middleware/logger");
let logEntry;

class ReviewController {
    async getReviews(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            } else {
                const { book } = req.body;
                let bookRequested = await BookModel.findOne({ _id: book });

                if (!bookRequested) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book does not exist"));
                }

                const allReviews = await ReviewModel.find({ book: book })
                    .populate("user", "name")
                    .sort({ "verifiedTransaction": -1 });

                console.log(allReviews);
                if (allReviews.length > 0) {
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.OK).send(
                        success("Successfully got all the reviews", {
                            allReviews,
                            totalRating: bookRequested.rating,
                        })
                    );
                } else {
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.OK).send(success("No review found"));
                }

                // const totalRating = ReviewModel.aggregate([
                //   {
                //     $match: { book: book },
                //   },
                //   {
                //     $project: {
                //       totalRating: { $avg: "$rating" }, 
                //     },
                //   },
                // ])
                //   .then((results) => {
                //     console.log(results);
                //   })
                //   .catch((error) => {
                //     console.error(error);
                //   });
                // // console.log(totalRating);
            }
        } catch (error) {
            console.log(error);
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from get-review"));
        }
    }

    async addReview(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            } else {
                const { user, book, rating, review } = req.body;
                let userRequested = await UserModel.findOne({ _id: user });
                if (!userRequested) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("User does not exist"));
                }
                let bookRequested = await BookModel.findOne({ _id: book });
                if (!bookRequested) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book does not exist"));
                }
                const existingReview = await ReviewModel.findOne({
                    book: book,
                    user: user,
                });
                if (existingReview) {
                    logEntry = `${req.url} | status: redirect request | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.MISDIRECTED_REQUEST)
                        .send(success("You have already reviewed this book. Update review from 127.0.0.1:8000/review/update-review"));
                }

                let verifiedTransaction = false;
                let transaction = await TransactionModel.findOne({
                    user: user, "books.book": book
                });
                console.log(transaction);

                if (transaction) {
                    verifiedTransaction = true;
                    // console.log(`User with ID ${user} has an order with book ID ${book}.`);
                }

                const reviewData = new ReviewModel({
                    user,
                    book,
                    rating,
                    review,
                    verifiedTransaction,
                });console.log(reviewData);
                const reviewCount = bookRequested.ratingCount;

                if (!reviewCount || reviewCount === 0) {
                    bookRequested.rating = rating;
                    bookRequested.ratingCount = 1;
                } else {
                    bookRequested.rating = ((bookRequested.rating * reviewCount) + rating) / (reviewCount + 1);
                    bookRequested.ratingCount += 1;
                }
                // console.log(bookRequested);
                await bookRequested.save();

                await reviewData
                    .save()
                    .then((data) => {
                        data["updatedRating"] = bookRequested.rating;
                        console.log(data);
                        logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                        logger.addLog(logEntry);
                        return res
                            .status(HTTP_STATUS.OK)
                            .send(success("Successfully added the review", data));
                    })
                    .catch((err) => {
                        console.log(err);
                        logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                        logger.addLog(logEntry);
                        return res
                            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                            .send(failure("Failed to add the review"));
                    });
            }
        } catch (error) {
            console.log(error);
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-review"));
        }
    }

    async updateReview(req, res) {
        try {
            console.log("executing updateUser");
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            console.log("Executing here");
            const { user, book, review } = req.body;
            let userRequested = await UserModel.findOne({ _id: user });
            if (!userRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("User does not exist"));
            }
            let bookRequested = await BookModel.findOne({ _id: book });
            if (!bookRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Book does not exist"));
            }

            let reviewRequested = await ReviewModel.findOne({ user: user, book: book });

            if (reviewRequested) {
                const updatedReview = await ReviewModel.updateOne(
                    { user: user, book: book },
                    { $set: { review: review } });

                if (updatedReview) {
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.ACCEPTED)
                        .send(success("Successfully updated the review"));
                } else {
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("Failed to updated the review"));
                }
            } else {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("No review found for the book of this user"));
            }
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while updating review"));
        }
    }

    async deleteReview(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            const { user, book } = req.body;
            let userRequested = await UserModel.findOne({ _id: user });
            if (!userRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("User does not exist"));
            }
            let bookRequested = await BookModel.findOne({ _id: book });
            if (!bookRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Book does not exist"));
            }

            let reviewRequested = await ReviewModel.findOne({ user: user, book: book });
            const rating = reviewRequested.rating;

            if (reviewRequested) {
                const review = await ReviewModel.deleteOne({ user: user, book: book });

                if (review) {
                    const reviewCount = bookRequested.ratingCount;
                    // const reviewCount = await ReviewModel.find({
                    //     book: book,
                    // }).countDocuments();
                    if (reviewCount === 0) {
                        bookRequested.rating = 0;
                        bookRequested.ratingCount = 0;
                    } else {
                        bookRequested.rating =
                            Math.ceil((bookRequested.rating * reviewCount) - rating) / (reviewCount - 1);
                        bookRequested.ratingCount -= 1;
                    }
                    // console.log(bookRequested);
                    await bookRequested.save();
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.ACCEPTED)
                        .send(success("Successfully deleted the review"));
                } else {
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("Failed to delete the review"));
                }
            } else {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("No review found for the book of this user"));
            }
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while deleting review"));
        }
    }
}

module.exports = new ReviewController();
