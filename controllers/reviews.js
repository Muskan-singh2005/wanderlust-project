const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const review = new Review(req.body.review);
  review.author = req.user._id; // ✅ assign current user as author

  listing.reviews.push(review);
  await review.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  // ✅ Check if the current user is the review's author
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }

  // ✅ Remove review reference from listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // ✅ Delete the review
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
