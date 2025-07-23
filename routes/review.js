const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams is crucial for nested routes

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware"); // Ensure the user is logged in
const wrapAsync = require("../utils/wrapAsync");
const reviewController = require("../controllers/reviews.js");


// CREATE a new review
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// DELETE a review (optional)
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;
