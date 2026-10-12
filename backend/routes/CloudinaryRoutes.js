const express = require("express");
const cloudinaryRouter = express.Router();
const ControllerFactory = require("../factories/controllerFactory.js");

cloudinaryRouter.post(
  "/profile-picture/sign",
  ControllerFactory.getCloudinaryController().getSignedProfilePictureUpload
);

cloudinaryRouter.post(
  "/media/sign",
  ControllerFactory.getCloudinaryController().getSignedMediaUpload
);

module.exports = cloudinaryRouter;
