import { api } from "./client";

/** Signed params returned by the backend for a direct Cloudinary upload. */
export interface CloudinarySignedUpload {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: string;
}

const signProfilePicture = (phoneNumber: string) =>
  api.post<CloudinarySignedUpload>("/cloudinary/profile-picture/sign", {
    phoneNumber,
  });

const signMedia = (phoneNumber: string, resourceType = "auto") =>
  api.post<CloudinarySignedUpload>("/cloudinary/media/sign", {
    phoneNumber,
    resourceType,
  });

/** POSTs the file straight to Cloudinary with the signed params; returns the secure URL. */
async function uploadSigned(
  file: File,
  signed: CloudinarySignedUpload,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);
  form.append("public_id", signed.publicId);

  const response = await fetch(signed.uploadUrl, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed (${response.status})`);
  }
  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary did not return a URL");
  return data.secure_url;
}

export const cloudinaryApi = {
  /** Sign + upload a profile picture; resolves to its hosted URL. */
  uploadProfilePicture: async (phoneNumber: string, file: File) =>
    uploadSigned(file, await signProfilePicture(phoneNumber)),

  /** Sign + upload a chat attachment; resolves to its hosted URL. */
  uploadMedia: async (phoneNumber: string, file: File) => {
    const resourceType = file.type.startsWith("video/") ? "video" : "auto";
    return uploadSigned(file, await signMedia(phoneNumber, resourceType));
  },
};
