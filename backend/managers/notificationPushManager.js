require("dotenv").config();

const webpush = require("web-push");
const LoggerFactory = require("../factories/loggerFactory.js");

class NotificationPushManager {
  #publicKey = null;
  #configured = false;

  constructor() {
    this.#initialize();
  }

  #initialize() {
    LoggerFactory.getApplicationLogger.info(`Initializing web-push...`);

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject =
      process.env.VAPID_SUBJECT ??
      (process.env.EMAIL ? `mailto:${process.env.EMAIL}` : null);

    if (publicKey == null || privateKey == null || subject == null) {
      LoggerFactory.getApplicationLogger.error(
        `One or more environment variables are not set: {VAPID_PUBLIC_KEY} {VAPID_PRIVATE_KEY} {VAPID_SUBJECT|EMAIL} -- push disabled.`
      );
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.#publicKey = publicKey;
    this.#configured = true;
  }

  get getPublicKey() {
    return this.#publicKey;
  }

  get isConfigured() {
    return this.#configured;
  }

  // Sends a payload to one subscription; resolves false on a gone/expired endpoint.
  async sendToSubscription(subscription, payload) {
    if (!this.#configured) return false;

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (exception) {
      LoggerFactory.getApplicationLogger.error(
        `web-push send failed (${exception.statusCode}): ${exception.message}`
      );
      return exception.statusCode !== 404 && exception.statusCode !== 410;
    }
  }
}

module.exports = NotificationPushManager;
