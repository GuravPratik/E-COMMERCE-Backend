const express = require("express");
const router = express.Router();
const { SignUp, login, logout } = require("../controllers/userController");
router.route("/signup").post(SignUp);
router.route("/login").post(login);
router.route("/logout").get(logout);

module.exports = router;
