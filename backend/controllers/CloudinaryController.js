const ManagerFactory = require("../factories/managerFactory.js");
const LoggerFactory = require("../factories/loggerFactory.js");
const ExceptionHelper = require("../exception/ExceptionHelper.js");
const ServiceFactory = require("../factories/serviceFactory.js");
const CommonUtils = require("../utilities/commonUtils.js");
const CloudinaryConstants = require("../constants/cloudinaryConstants.js");

class CloudinaryController {
  constructor() {}

  getSignedProfilePictureUpload = async (request, response) => {
    try {
      const user = await this.#resolveUser(request.body?.phoneNumber, response);
      if (user.handled) return;

      const publicId = await this.#generatePublicId(user.data);

      const signedUpload =
        await ManagerFactory.getCloudinaryManager().generateSignedProfilePictureUpload(
          publicId
        );

      response.json(signedUpload);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  getSignedMediaUpload = async (request, response) => {
    try {
      const user = await this.#resolveUser(request.body?.phoneNumber, response);
      if (user.handled) return;

      const publicId = await this.#generatePublicId(user.data);
      const resourceType =
        request.body?.resourceType ?? CloudinaryConstants.RESOURCE_TYPE_AUTO;

      const signedUpload =
        await ManagerFactory.getCloudinaryManager().generateSignedMediaUpload(
          publicId,
          resourceType
        );

      response.json(signedUpload);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  // Validates the phoneNumber and loads the user; returns {handled:true} if it already responded.
  async #resolveUser(phoneNumber, response) {
    const phoneNumberValidation = await ExceptionHelper.validate(
      phoneNumber,
      400,
      `phoneNumber is missing from the request body`,
      response
    );

    if (phoneNumberValidation) return { handled: true };

    const user = await ServiceFactory.getUserService.getDocumentByCustomFilters(
      {
        phoneNumber: phoneNumber,
      }
    );

    const userValidation = await ExceptionHelper.validate(
      user,
      400,
      `User does not exist in the database`,
      response
    );

    if (userValidation) return { handled: true };

    return { handled: false, data: user };
  }

  async #generatePublicId(userObject) {
    const publicId =
      (await CommonUtils.generateUuid()) + "-" + userObject._id.toString();
    LoggerFactory.getApplicationLogger.info(
      `Cloudinary public_id created: ${publicId}`
    );
    return publicId;
  }
}

module.exports = CloudinaryController;
