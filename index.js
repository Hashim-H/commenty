const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());
app.use(logger("dev"));
app.set("env", NODE_ENV);
app.set("port", PORT);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/", require("./routes")); // for routes

app.use((req, res, next) => {
  // error not found
  const err = new Error(`${req.method} ${req.url} Not Found`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // code exceptions
  console.log(err.status, err.message);
  let message = { error: { message: err.message } };
  let status = +err.status || 400;
  if (err) {
    return res.status(400).json({ ...message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  //anything
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      "port"
    )} | Environment : ${app.get("env")}`
  );
});
