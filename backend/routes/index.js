const express = require("express");
const router = express.Router();
const googleRouter = require("./googleRouter");
const userRouter = require("./userRouter");
const scheduleRouter = require("./scheduleRouter");

router.use("/auth", googleRouter);
router.use(`/${process.env.API_VERSION}/user`, userRouter);
router.use(`/${process.env.API_VERSION}/schedule`, scheduleRouter);

module.exports = router;
