const express = require("express");
const notificationRouter = express.Router();
const NotificationController = require("../controllers/NotificationController.js");

const notificationController = new NotificationController();

notificationRouter.get("/all", notificationController.getAllNotifications);
notificationRouter.get("/vapidPublicKey", notificationController.getVapidPublicKey);
notificationRouter.post("/subscribe", notificationController.subscribe);
notificationRouter.post("/unsubscribe", notificationController.unsubscribe);

module.exports = notificationRouter;
