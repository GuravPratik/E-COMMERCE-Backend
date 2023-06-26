const express = require("express");
const router = express.Router();
const {
  SignUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
router.route("/signup").post(SignUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);

module.exports = router;
