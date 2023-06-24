const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
// routes imports
const home = require("./routes/home");

// app
const app = express();

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use(morgan("tiny"));

// router middleware
app.use("/api/v1", home);

module.exports = app;
