const express = require("express");
const authController = require("../controllers/authcontroller");
const { restrictToLoggedInUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", authController.handleUserSignup);
router.post("/login", authController.handleUserLogin);

router.post("/logout", authController.handleUserLogout);

router
  .route("/profile")
  .get(restrictToLoggedInUser, authController.handleFetchUserProfile)
  .put(restrictToLoggedInUser, authController.handleUpdateUserProfile);

module.exports = router;
