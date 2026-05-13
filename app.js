if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const app = express();

// Models and Routers
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

// Utilities
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { isLoggedIn } = require("./middleware.js");

// ======================
// MongoDB Connection
// ======================

const dbUrl = process.env.MONGO_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });

// ======================
// View Engine & Middleware
// ======================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// ======================
// Session Configuration
// ======================

const sessionConfig = {
  secret: process.env.SECRET || "mysupersecretkey",
  resave: false,
  saveUninitialized: true,

  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

app.use(session(sessionConfig));

app.use(flash());

// ======================
// Passport Configuration
// ======================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// ======================
// Flash & Current User
// ======================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currentUser = req.user;

  next();
});

// ======================
// Routes
// ======================

app.use("/", userRouter);

app.use("/listings", listingRouter);

// ======================
// Home Route
// ======================

app.get("/", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You need to login first!");

    return res.redirect("/login");
  }

  res.redirect("/listings");
});

// ======================
// All Listings
// ======================

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index.ejs", { allListings });
  })
);

// ======================
// New Listing Form
// ======================

app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// ======================
// Show Listing
// ======================

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
      req.flash("error", "Listing not found!");

      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  })
);

// ======================
// Create Listing
// ======================

app.post(
  "/listings",
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);

    await newListing.save();

    req.flash("success", "New listing created!");

    res.redirect("/listings");
  })
);

// ======================
// Edit Listing Form
// ======================

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");

      return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
  })
);

// ======================
// Update Listing
// ======================

app.put(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndUpdate(id, req.body);

    req.flash("success", "Listing updated!");

    res.redirect(`/listings/${id}`);
  })
);

// ======================
// Delete Listing
// ======================

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted!");

    res.redirect("/listings");
  })
);

// ======================
// Add Review
// ======================

app.post(
  "/listings/:id/reviews",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();

    await listing.save();

    req.flash("success", "Review added!");

    res.redirect(`/listings/${listing._id}`);
  })
);

// ======================
// Delete Review
// ======================

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");

    res.redirect(`/listings/${id}`);
  })
);

// ======================
// 404 Handler
// ======================

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ======================
// Error Handler
// ======================

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).send(message);
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
