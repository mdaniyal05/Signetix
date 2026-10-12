class CloudinaryConstants {
  static DEFAULT_PROFILE_PICTURES_FOLDER = "signetix/profile-pictures";
  static DEFAULT_MEDIA_FOLDER = "signetix/media";

  // Cloudinary resource types (image for pictures, auto lets Cloudinary detect media).
  static RESOURCE_TYPE_IMAGE = "image";
  static RESOURCE_TYPE_AUTO = "auto";

  static UPLOAD_URL_TEMPLATE = "https://api.cloudinary.com/v1_1";
}

module.exports = CloudinaryConstants;
