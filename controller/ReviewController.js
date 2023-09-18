const { validationResult } = require("express-validator");
const ReviewModel = require("../model/Review");
const BookModel = require("../model/Book");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class ReviewController {
    async getReviews(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            } else {
                const { book } = req.body;
                let bookRequested = await BookModel.findOne({ _id: book });

                if (!bookRequested) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book does not exist"));
                }

                const allReviews = await ReviewModel.find({
                    book: book,
                }).populate("user", "name");

                if (allReviews.length > 0) {
                    return res.status(HTTP_STATUS.OK).send(
                        success("Successfully got all the reviews", {
                            allReviews,
                            totalRating: bookRequested.rating,
                        })
                    );
                } else {
                    return res.status(HTTP_STATUS.OK).send(success("No review found"));
                }

                // const totalRating = ReviewModel.aggregate([
                //   {
                //     $match: { book: book },
                //   },
                //   {
                //     $project: {
                //       totalRating: { $avg: "$rating" }, // Calculate the total sales for each brand
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
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-review"));
        }
    }

    async addReview(req, res) {
        try {
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            } else {
                const { book, user, rating, review } = req.body;
                let bookRequested = await BookModel.findOne({ _id: book });

                if (!bookRequested) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book does not exist"));
                }
                const reviewData = new ReviewModel({
                    book,
                    user,
                    rating,
                    review,
                });
                const existingReview = await ReviewModel.findOne({
                    book: book,
                    user: user,
                });
                if (existingReview) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("You have already reviewed this book"));
                }

                const reviewCount = await ReviewModel.find({
                    book: book,
                }).countDocuments();
                if (reviewCount === 0) {
                    bookRequested.rating = rating;
                } else {
                    bookRequested.rating =
                        (bookRequested.rating * reviewCount + rating) / (reviewCount + 1);
                }
                // console.log(bookRequested);
                await bookRequested.save();

                await reviewData
                    .save()
                    .then((data) => {
                        data["updatedRating"] = bookRequested.rating;
                        console.log(data);
                        return res
                            .status(HTTP_STATUS.OK)
                            .send(success("Successfully added the review", data));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                            .send(failure("Failed to add the review"));
                    });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-review"));
        }
    }
}

module.exports = new ReviewController();
