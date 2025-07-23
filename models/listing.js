const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  location: String,
  image: {
    url: String,
    filename: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User", // 👈 referencing the User model
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // 👈 referencing Review model
    }
  ],
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
