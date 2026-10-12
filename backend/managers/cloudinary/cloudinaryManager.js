require("dotenv").config();

const { v2: cloudinary } = require("cloudinary");
const Cloudinary = require("./models/Cloudinary.js");
const CloudinarySignedUploadResponse = require("./models/CloudinarySignedUploadResponse.js");
const CloudinaryConstants = require("../../constants/cloudinaryConstants.js");
const LoggerFactory = require("../../factories/loggerFactory.js");

class CloudinaryManager {
  /**
   * @type {Cloudinary | null}
   */
  #cloudinaryDto = null;

  constructor() {
    this.#createCloudinaryDto();
  }

  #createCloudinaryDto() {
    LoggerFactory.getApplicationLogger.info(
      `Pulling in Cloudinary information...`
    );

    if (
      process.env.CLOUDINARY_CLOUD_NAME == null ||
      process.env.CLOUDINARY_API_KEY == null ||
      process.env.CLOUDINARY_API_SECRET == null
    ) {
      LoggerFactory.getApplicationLogger.error(
        `One or more environment variables are not set: {CLOUDINARY_CLOUD_NAME} {CLOUDINARY_API_KEY} {CLOUDINARY_API_SECRET} -- kindly check!`
      );

      return;
    }

    this.#cloudinaryDto = new Cloudinary(
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET,
      process.env.CLOUDINARY_PROFILE_PICTURES_FOLDER ??
        CloudinaryConstants.DEFAULT_PROFILE_PICTURES_FOLDER,
      process.env.CLOUDINARY_MEDIA_FOLDER ??
        CloudinaryConstants.DEFAULT_MEDIA_FOLDER
    );

    cloudinary.config({
      cloud_name: this.#cloudinaryDto.cloudName,
      api_key: this.#cloudinaryDto.apiKey,
      api_secret: this.#cloudinaryDto.apiSecret,
      secure: true,
    });
  }

  get getCloudinaryDto() {
    return this.#cloudinaryDto;
  }

  async generateSignedProfilePictureUpload(publicId) {
    return this.#generateSignedUpload(
      this.#cloudinaryDto.profilePicturesFolder,
      publicId,
      CloudinaryConstants.RESOURCE_TYPE_IMAGE
    );
  }

  async generateSignedMediaUpload(
    publicId,
    resourceType = CloudinaryConstants.RESOURCE_TYPE_AUTO
  ) {
    return this.#generateSignedUpload(
      this.#cloudinaryDto.mediaFolder,
      publicId,
      resourceType
    );
  }

  // Signs the upload params so the client can POST the file straight to Cloudinary.
  #generateSignedUpload(folder, publicId, resourceType) {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { folder: folder, public_id: publicId, timestamp: timestamp },
      this.#cloudinaryDto.apiSecret
    );

    const uploadUrl = `${CloudinaryConstants.UPLOAD_URL_TEMPLATE}/${this.#cloudinaryDto.cloudName}/${resourceType}/upload`;

    const response = new CloudinarySignedUploadResponse(
      uploadUrl,
      this.#cloudinaryDto.cloudName,
      this.#cloudinaryDto.apiKey,
      timestamp,
      signature,
      folder,
      publicId,
      resourceType
    );

    LoggerFactory.getApplicationLogger.info(
      `Generated Cloudinary signed upload: ${JSON.stringify({ folder, publicId, resourceType })}`
    );

    return response;
  }
}

module.exports = CloudinaryManager;
