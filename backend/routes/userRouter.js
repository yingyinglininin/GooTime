const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");
require("../middlewares/jwt");

// Sign in does not require JWT verification
router.route("/signin").post(userController.userSignIn);

router
  .route("/calendar")
  .post(userController.createUserCalendarList)
  .get(userController.getUserCalendarList);

router
  .route("/name")
  .get(
    passport.authenticate("jwt", { session: false }),
    userController.getUserName
  );

module.exports = router;
