import { useMutation } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

interface UploadProfilePicturePayload {
  imageFile: File
  phoneNumber: string
}

interface UploadProfilePictureResponse {
  publicUrl: string
}

export const uploadProfilePicture = async ({
  imageFile,
  phoneNumber,
}: UploadProfilePicturePayload): Promise<UploadProfilePictureResponse> => {
  const extension = "." + (imageFile.name.split(".").pop() ?? "jpg")

  const token = getToken()

  const response = await fetchWithAuth(`${API_URL}/amazon/s3`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify({ phoneNumber, extension }),
  })

  if (!response.ok) throw new Error("Failed to get presigned URL")

  const { presignedUrl, publicUrl } = (await response.json()) as {
    presignedUrl: string
    publicUrl: string
  }

  const uploadResult = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": imageFile.type },
    body: imageFile,
  })

  if (!uploadResult.ok) throw new Error("Failed to upload to S3")

  return { publicUrl }
}

export const useUploadProfilePictureMutation = () =>
  useMutation({ mutationFn: uploadProfilePicture })
