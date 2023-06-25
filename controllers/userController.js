const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
exports.SignUp = BigPromise((req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Ecommerce API Signup page",
  });
});
