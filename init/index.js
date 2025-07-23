// index.js or seed.js
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("./models/listing.js"); // ✅ Correct relative path

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.log("Connection error:", err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data.map((obj)=>({...obj,owner:"687801feb9024fb6861074ce"}));

  
  await Listing.insertMany(initData.data);
  console.log("Database seeded");
};

initDB();
