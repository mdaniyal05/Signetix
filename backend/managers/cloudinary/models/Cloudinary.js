class Cloudinary {
  constructor(
    cloudName,
    apiKey,
    apiSecret,
    profilePicturesFolder,
    mediaFolder
  ) {
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.profilePicturesFolder = profilePicturesFolder;
    this.mediaFolder = mediaFolder;
  }
}

module.exports = Cloudinary;
