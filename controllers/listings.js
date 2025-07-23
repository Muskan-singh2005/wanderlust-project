const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // ✅ populates each review's author
      },
    })
    .populate("owner"); // ✅ populates the listing owner

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url=req.file.path;
  let filename=req.file.filename;
  console.log(url,"..",filename);
  //const newListing = new Listing(req.body);
  //newListing.owner = req.user._id; // ✅ Assign the logged-in user as owner
  //await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",          // ✅ nested populate fix
      populate: {
        path: "author",
      },
    })
    .populate("owner"); // ✅ ensure owner is available

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

module.exports.UpdateListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body);
  req.flash("success", "Listing updated!");
  res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};