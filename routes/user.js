const express = require("express");
const router = express.Router();
const { SignUp } = require("../controllers/userController");
router.route("/signup").post(SignUp);

module.exports = router;
