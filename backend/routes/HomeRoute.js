const express = require("express");
const homeRouter = express.Router();

// Root route
homeRouter.get("/", (req, res) => {
  res.send("Hello, Welcome to Signetix!");
});

module.exports = homeRouter;
