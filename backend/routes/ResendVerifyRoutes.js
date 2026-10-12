const express = require("express");
const resendVerifyRouter = express.Router();
const ExceptionHelper = require("../exception/ExceptionHelper.js");
const ControllerFactory = require("../factories/controllerFactory.js");

resendVerifyRouter.get("/", async (request, response) => {
  return await ExceptionHelper.validate(
    null,
    400,
    `phoneNumber path parameter is required!`,
    response
  );
});

resendVerifyRouter.get(
  "/getOtp/:phoneNumber",
  ControllerFactory.getResendOtpController().getOtp
);

resendVerifyRouter.post(
  "/verifyOtp",
  ControllerFactory.getResendOtpController().verifyOtp
);

module.exports = resendVerifyRouter;
