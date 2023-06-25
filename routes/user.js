const express = require("express");
const router = express.Router();
const { SignUp, login } = require("../controllers/userController");
router.route("/signup").post(SignUp);
router.route("/login").post(login);

module.exports = router;
