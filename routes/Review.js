const express = require("express");
const routes = express();
const ReviewController = require("../controller/ReviewController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");

routes.get("/get-reviews", authValidation.isAuthorized, expressValidation.getReview, ReviewController.getReviews);
routes.post("/add-review", authValidation.isAuthorized, authValidation.isCustomer, expressValidation.addReview, ReviewController.addReview);
routes.patch("/update-review", authValidation.isAuthorized, authValidation.isCustomer, expressValidation.updateReview, ReviewController.updateReview);
routes.delete("/delete-review", authValidation.isAuthorized, authValidation.isCustomer, expressValidation.isValidUser, expressValidation.isValidBook, ReviewController.deleteReview);

module.exports = routes;
