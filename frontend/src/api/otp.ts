import { api } from "./client";

const enc = encodeURIComponent;

export const otpApi = {
  /** Generate + email a verification code to the user's address. */
  request: (phoneNumber: string) =>
    api.get<{ status: string; channel: string; to: string }>(
      `/resend/getOtp/${enc(phoneNumber)}`,
    ),

  /** Validate the emailed code; marks the account verified on success. */
  verify: (phoneNumber: string, otpCode: string) =>
    api.post<{ valid: boolean; status: string }>("/resend/verifyOtp", {
      phoneNumber,
      otpCode,
    }),
};
