const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const userController = require("../controllers/users.js");
const wrapAsync = require("../utils/wrapAsync");

// ==================== SIGNUP ====================
router
  .route("/signup")
  .get(userController.renderSignupForm)       // Show signup form
  .post(wrapAsync(userController.signup));    // Handle signup form submission

// ==================== LOGIN ====================
router
  .route("/login")
  .get(userController.renderLoginForm)        // Show login form
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login                      // Handle successful login
  );

// ==================== LOGOUT ====================
router.get("/logout", userController.logout);

// ✅ Export the router
module.exports = router;
