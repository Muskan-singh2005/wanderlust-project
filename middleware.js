const Listing = require("./models/listing.js");
const Review = require("./models/review");
module.exports.isLoggedIn = (req, res, next) => {
    console.log("User in isLoggedIn:", req.user);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to access this page");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirect = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!listing.owner || !req.user || !listing.owner.equals(req.user._id)) {
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        console.error("Error in isOwner middleware:", err);
        req.flash("error", "Something went wrong");
        return res.redirect("/listings");
    }
};
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to delete this review");
        return res.redirect("back");
    }
    next();
};
