const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise((req, res) => {
  res.render("formTest");
  // res.status(200).json({
  //   success: true,
  //   message: "Welcome to Ecommerce API",
  // });
});
