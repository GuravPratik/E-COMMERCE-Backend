const express = require("express");
const {
  addProduct,
  getProduct,
  adminGetAllProduct,
  getSingleProduct,
  adminUpdateSingleProduct,
  adminDeleteSingleProduct,
  addProductReview,
} = require("../controllers/productController");
const { isLoggedIn, checkRole } = require("../middlewares/authUser");
const router = express.Router();

// user route
router.route("/products").get(getProduct);
router.route("/product/:id").get(getSingleProduct);
router.route("/product/:id/review").put(isLoggedIn, addProductReview);

// admin route
router
  .route("/admin/products")
  .get(isLoggedIn, checkRole("admin"), adminGetAllProduct);
router
  .route("/admin/product/create")
  .post(isLoggedIn, checkRole("admin"), addProduct);
router
  .route("/admin/product/:id")
  .patch(isLoggedIn, checkRole("admin"), adminUpdateSingleProduct)
  .delete(isLoggedIn, checkRole("admin"), adminDeleteSingleProduct);

module.exports = router;
