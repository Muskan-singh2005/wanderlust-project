const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists by username or email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      req.flash("error", "This user is already registered!");
      return res.redirect("/signup");
    }

    // Register new user
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Registered successfully!");
      res.redirect("/listings");
    });

  } catch (err) {
    console.error("Signup error:", err);
    req.flash("error", "Registration failed. Try again.");
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
};
