const express = require("express");
const reportRouter = express.Router();
const ReportController = require("../controllers/ReportController.js");

const reportController = new ReportController();

reportRouter.get("/all", reportController.getAllReports);
reportRouter.post("/create", reportController.createReport);

module.exports = reportRouter;
