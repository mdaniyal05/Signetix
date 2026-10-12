const ManagerFactory = require("../factories/managerFactory.js");
const LoggerFactory = require("../factories/loggerFactory.js");
const ExceptionHelper = require("../exception/ExceptionHelper.js");
const ServiceFactory = require("../factories/serviceFactory.js");
const SignetixException = require("../exception/SignetixException.js");
const EventDispatcher = require("../events/eventDispatcher.js");
const EventConstants = require("../constants/eventConstants.js");
const OtpDto = require("../dtos/OtpDto.js");
const ControllerConstants = require("../constants/controllerConstants.js");
const CommonUtils = require("../utilities/commonUtils.js");

class ResendOtpController {
  constructor() {}

  // Generates a code, stores it on the auth record, and emails it via Resend.
  getOtp = async (request, response) => {
    try {
      const phoneNumber = request.params.phoneNumber;

      const user =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: phoneNumber,
        });

      const userValidation = await ExceptionHelper.validate(
        user,
        400,
        `User does not exist in the database`,
        response
      );

      if (userValidation) return userValidation;

      const emailValidation = await ExceptionHelper.validate(
        user.email,
        400,
        `User has no email on file to send the OTP to`,
        response
      );

      if (emailValidation) return emailValidation;

      const authRecord = await this.#getAuthRecord(user, response);
      if (authRecord.handled) return;

      const otpCode = await CommonUtils.generateNumericCode(
        ControllerConstants.OTP_CODE_LENGTH
      );

      await ServiceFactory.getUserAuthenticationService.updateDocument(
        authRecord.data._id,
        {
          otpCode: otpCode,
          otpExpiresAt: new Date(
            Date.now() + ControllerConstants.OTP_EXPIRY_IN_MS
          ),
          updatedAt: Date.now(),
        }
      );

      await ManagerFactory.getResendManager().sendOtpEmail(
        user.email,
        otpCode,
        user.name
      );

      LoggerFactory.getApplicationLogger.info(
        `OTP emailed to ${user.email} for phoneNumber ${phoneNumber}`
      );

      response.json({ status: "pending", channel: "email", to: user.email });
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  // Validates the stored code + expiry, then marks the user verified.
  verifyOtp = async (request, response) => {
    try {
      const otpDto = new OtpDto(
        request.body?.phoneNumber,
        request.body?.otpCode
      );

      const otpCodeValidation = await ExceptionHelper.validate(
        otpDto.otpCode,
        400,
        `otpCode from the body is missing.`,
        response
      );

      if (otpCodeValidation) return otpCodeValidation;

      const phoneNumberValidation = await ExceptionHelper.validate(
        otpDto.phoneNumber,
        400,
        `phoneNumber from the body is missing.`,
        response
      );

      if (phoneNumberValidation) return phoneNumberValidation;

      const user =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: otpDto.phoneNumber,
        });

      const userValidation = await ExceptionHelper.validate(
        user,
        400,
        `User does not exist in the database`,
        response
      );

      if (userValidation) return userValidation;

      const authRecord = await this.#getAuthRecord(user, response);
      if (authRecord.handled) return;

      const isValid =
        authRecord.data.otpCode != null &&
        authRecord.data.otpCode === otpDto.otpCode &&
        authRecord.data.otpExpiresAt != null &&
        authRecord.data.otpExpiresAt.getTime() >= Date.now();

      if (!isValid) {
        const signetixException = new SignetixException(
          400,
          `Invalid or expired OTP code.`
        );
        return response
          .status(signetixException.status)
          .json(signetixException.loadResult());
      }

      // Clear the used code and mark verified.
      await ServiceFactory.getUserAuthenticationService.updateDocument(
        authRecord.data._id,
        { otpCode: null, otpExpiresAt: null, updatedAt: Date.now() }
      );

      EventDispatcher.dispatchEvent(
        EventConstants.USER_AUTHENTICATION_UPDATE_EVENT,
        { userId: user._id.toString(), isVerified: true }
      );

      response.json({ valid: true, status: "approved" });
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  async #getAuthRecord(user, response) {
    const authRecord =
      await ServiceFactory.getUserAuthenticationService.getDocumentByCustomFilters(
        { userId: user._id.toString() }
      );

    const validation = await ExceptionHelper.validate(
      authRecord,
      400,
      `userAuthentication record not found - create a new account to get one`,
      response
    );

    if (validation) return { handled: true };

    return { handled: false, data: authRecord };
  }
}

module.exports = ResendOtpController;
