import { api } from "./client";

export const notificationsApi = {
  getVapidPublicKey: () =>
    api.get<{ publicKey: string | null }>("/notifications/vapidPublicKey"),

  subscribe: (phoneNumber: string, subscription: PushSubscriptionJSON) =>
    api.post("/notifications/subscribe", { phoneNumber, subscription }),

  unsubscribe: (phoneNumber: string, endpoint: string) =>
    api.post("/notifications/unsubscribe", { phoneNumber, endpoint }),
};
