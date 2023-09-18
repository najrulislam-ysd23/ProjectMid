const express = require("express");
const routes = express();
const ReviewController = require("../controller/ReviewController");
const expressValidation = require("../middleware/ExpressValidator");
const authValidation = require("../middleware/Auth");

routes.get("/get-review", authValidation.isAuthorized, expressValidation.review, ReviewController.getReviews);
routes.post("/add-review", authValidation.isAuthorized, expressValidation.review, ReviewController.addReview);

module.exports = routes;
