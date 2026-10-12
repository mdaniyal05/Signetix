// Everything the client needs to upload one file directly to Cloudinary.
class CloudinarySignedUploadResponse {
  constructor(
    uploadUrl,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType
  ) {
    this.uploadUrl = uploadUrl;
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.timestamp = timestamp;
    this.signature = signature;
    this.folder = folder;
    this.publicId = publicId;
    this.resourceType = resourceType;
  }
}

module.exports = CloudinarySignedUploadResponse;
