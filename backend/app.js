require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const indexRouter = require("./routes/index");

const PORT = process.env.PORT;
const app = express();

// app.all("/*", function (req, res, next) {
//   const origin = req.get("origin");
//   console.log(origin);

//   req.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Headers", "Content-Type");
//   req.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   req.header("Access-Control-Allow-Credentials", "true");

//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   req.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   next();
// });

// jsconst corsOptions = {
//   origin: process.env.CORS_ORIGIN.split(","),
//   methods: "GET,POST",
//   allowedHeaders: ["Content-Type", "Request-Date", "Credentials", "Access-Control-Allow-Private-Network"]
// };

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api", indexRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
