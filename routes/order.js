const express = require("express");
const { isLoggedIn, checkRole } = require("../middlewares/authUser");
const {
  createOrder,
  getSingleOrder,
  getLoggedUserOrders,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminDeleteSingleOrder,
} = require("../controllers/orderController");
const router = express.Router();

// user
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getSingleOrder);
router.route("/myorder").get(isLoggedIn, getLoggedUserOrders);

//admin
router
  .route("/admin/orders")
  .get(isLoggedIn, checkRole("admin"), adminGetAllOrders);

router
  .route("/admin/order/:id")
  .patch(isLoggedIn, checkRole("admin"), adminUpdateOrderStatus)
  .delete(isLoggedIn, checkRole("admin"), adminDeleteSingleOrder);
module.exports = router;
