
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const  data  = require("./init/data"); // ✅ Adjust path if different

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to DB
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected for seeding.");
  })
  .catch((err) => {
    console.log("Connection error:", err);
  });

const seedDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(data);
  console.log("Database seeded with sample listings.");
};

seedDB().then(() => {
  mongoose.connection.close();
});
