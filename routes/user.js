const express = require("express");
const router = express.Router();
const {
  SignUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  passwordUpdate,
  updateUserDetails,
  adminGetAllUsers,
  adminGetSingleUser,
  adminUpdateUserRole,
  adminDeleteSingleUser,
} = require("../controllers/userController");
const { isLoggedIn, checkRole } = require("../middlewares/authUser");
router.route("/signup").post(SignUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/dashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, passwordUpdate);
router.route("/dashboard/user").patch(isLoggedIn, updateUserDetails);

// admin routes
router
  .route("/admin/users")
  .get(isLoggedIn, checkRole("admin"), adminGetAllUsers);

router
  .route("/admin/user/:id")
  .get(isLoggedIn, checkRole("admin"), adminGetSingleUser)
  .patch(isLoggedIn, checkRole("admin"), adminUpdateUserRole)
  .delete(isLoggedIn, checkRole("admin"), adminDeleteSingleUser);

module.exports = router;
