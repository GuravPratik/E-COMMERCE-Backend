const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

// routes imports
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
// app
const app = express();

app.set("view engine", "ejs");
// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(morgan("tiny"));

// router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);

module.exports = app;
