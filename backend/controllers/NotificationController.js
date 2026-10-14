const ServiceFactory = require("../factories/serviceFactory.js");
const ManagerFactory = require("../factories/managerFactory.js");
const ExceptionHelper = require("../exception/ExceptionHelper.js");
const LoggerFactory = require("../factories/loggerFactory.js");

class NotificationController {
  constructor() {}

  //Get all Notifications
  getAllNotifications = async (request, response) => {
    try {
      const notifications =
        await ServiceFactory.getNotificationService.getDocuments();

      response.json(notifications);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Get single Notification
  getNotificationById = async (request, response) => {
    try {
      const notificationId = request.params.id;

      const notification =
        await ServiceFactory.getNotificationService.getDocumentById(
          notificationId
        );

      response.json(notification);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Public VAPID key the browser needs to subscribe.
  getVapidPublicKey = async (request, response) => {
    response.json({
      publicKey: ManagerFactory.getNotificationPushManager().getPublicKey,
    });
  };

  //Store a browser push subscription on the user (deduped by endpoint).
  subscribe = async (request, response) => {
    try {
      const phoneValidation = await ExceptionHelper.validate(
        request.body.phoneNumber,
        400,
        `phoneNumber is required!`,
        response
      );
      if (phoneValidation) return phoneValidation;

      const subscription = request.body.subscription;
      if (subscription == null || subscription.endpoint == null) {
        return response
          .status(400)
          .json({ error: "A valid push subscription is required!" });
      }

      const user =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: request.body.phoneNumber,
        });
      const userValidation = await ExceptionHelper.validate(
        user,
        400,
        `phoneNumber doesn't exist in the user table!`,
        response
      );
      if (userValidation) return userValidation;

      const subscriptions = (user.pushSubscriptions ?? []).filter(
        (existing) => existing.endpoint !== subscription.endpoint
      );
      subscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      });

      await ServiceFactory.getUserService.updateDocument(
        { _id: user._id },
        { pushSubscriptions: subscriptions }
      );

      response.json({ success: true });
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Remove a push subscription (e.g. notifications turned off).
  unsubscribe = async (request, response) => {
    try {
      const phoneValidation = await ExceptionHelper.validate(
        request.body.phoneNumber,
        400,
        `phoneNumber is required!`,
        response
      );
      if (phoneValidation) return phoneValidation;

      const user =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: request.body.phoneNumber,
        });
      if (user == null) return response.json({ success: true });

      const subscriptions = (user.pushSubscriptions ?? []).filter(
        (existing) => existing.endpoint !== request.body.endpoint
      );

      await ServiceFactory.getUserService.updateDocument(
        { _id: user._id },
        { pushSubscriptions: subscriptions }
      );

      response.json({ success: true });
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  // Fire-and-forget push to every subscription a user has (called from other flows).
  static async sendToUserIds(userIds, payload) {
    try {
      const pushManager = ManagerFactory.getNotificationPushManager();
      if (!pushManager.isConfigured) return;

      const users =
        await ServiceFactory.getUserService.getDocumentsByCustomFilters({
          _id: { $in: userIds },
        });

      for (const user of users) {
        for (const subscription of user.pushSubscriptions ?? []) {
          await pushManager.sendToSubscription(subscription, payload);
        }
      }
    } catch (exception) {
      LoggerFactory.getApplicationLogger.error(
        `sendToUserIds failed: ${exception.message}`
      );
    }
  }
}

module.exports = NotificationController;
