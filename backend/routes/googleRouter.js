const express = require("express");
const googleController = require("../controllers/googleController");

const router = express.Router();

router.get("/login", googleController.login);
router.get("/google/callback", googleController.oauthCallback);
router.post("/google/calendar/events", googleController.getCalendarEvents);

module.exports = router;
