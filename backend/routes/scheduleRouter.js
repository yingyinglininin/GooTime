const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const passport = require("passport");
require("../middlewares/jwt");

// Sign in does not require JWT verification
router.route("/available").post(scheduleController.createAvailableTime);
router.route("/create").post(scheduleController.createSchedule);
router.route("/available/:link").get(scheduleController.getAvailableTimeByLink);
router.route("/submit").post(scheduleController.submitSchedule);

// Other APIs require JWT verification
router
  .route("/mySchedule")
  .get(
    passport.authenticate("jwt", { session: false }),
    scheduleController.getMySchedule
  );

module.exports = router;
