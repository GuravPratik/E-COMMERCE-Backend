const app = require("./app");
const connectToDB = require("./config/db");
const cloudinary = require("cloudinary");
require("dotenv").config();

connectToDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, (req, res) => {
  console.log("server is up and running http://localhost:" + process.env.PORT);
});
