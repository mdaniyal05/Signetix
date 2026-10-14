import { api } from "./client";

export type ReportReason = "Harassment" | "Spam" | "Inappropriate Content";

export const reportsApi = {
  create: (
    reportedByPhoneNumber: string,
    reportedUserPhoneNumber: string,
    reason: ReportReason,
  ) =>
    api.post("/reports/create", {
      reportedByPhoneNumber,
      reportedUserPhoneNumber,
      reason,
    }),
};
