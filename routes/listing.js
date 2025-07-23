const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner } = require("../middleware.js");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage }); // Store uploads locally

// Optional: Add Joi validation later
const validateListing = (req, res, next) => {
  next();
};

// Index and Create Listing
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),  // handle image uploa
    wrapAsync(listingController.createListing)
  );

// New listing form (should come before any :id route)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, and Delete Listing
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), // optional update image
    validateListing,
    wrapAsync(listingController.UpdateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit listing form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
