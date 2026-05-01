/**
 * ServiceFactory takes on the responsibility of initializing and providing instances
 * of all database-esque services. Since these services are stateless, factory pattern
 * serves as a nuanced approach to mitigate the issue of creating redundant instances across different scripts.
 */

//services
const CallHistoryService = require("../services/CallHistoryService.js");
const ContactService = require("../services/ContactService.js");
const MediaService = require("../services/MediaService.js");
const MessageService = require("../services/MessageService.js");
const ChatService = require("../services/ChatService.js");
const NotificationService = require("../services/NotificationService.js");
const ReactionService = require("../services/ReactionService.js");
const ReportService = require("../services/ReportService.js");
const SettingsService = require("../services/SettingsService.js");
const UserActivityService = require("../services/UserActivityService.js");
const UserService = require("../services/UserService.js");
const UserAuthenticationService = require("../services/UserAuthenticationService.js");
const MongooseService = require("../services/MongooseService.js");

//models
const CallHistory = require("../models/CallHistory.js");
const Contact = require("../models/Contact.js");
const Media = require("../models/Media.js");
const Message = require("../models/Message.js");
const Chat = require("../models//Chat.js");
const Notification = require("../models/Notification.js");
const Reaction = require("../models/Reaction.js");
const Report = require("../models/Report.js");
const Settings = require("../models/Settings.js");
const User = require("../models/User.js");
const UserActivity = require("../models/UserActivity.js");
const UserAuthentication = require("../models/UserAuthentication.js");

class ServiceFactory {
  //private fields
  /**
   * @private
   * @type {CallHistoryService | null}
   */
  static #callHistoryService = null;

  /**
   * @private
   * @type {ContactService | null}
   */
  static #contactService = null;

  /**
   * @private
   * @type {MediaService | null}
   */
  static #mediaService = null;

  /**
   * @private
   * @type {MessageService | null}
   */
  static #messageService = null;

  /**
   * @private
   * @type {ChatService | null}
   */
  static #chatService = null;

  /**
   * @private
   * @type {NotificationService | null}
   */
  static #notificationService = null;

  /**
   * @private
   * @type {ReactionService | null}
   */
  static #reactionService = null;

  /**
   * @private
   * @type {ReportService | null}
   */
  static #reportService = null;

  /**
   * @private
   * @type {SettingsService | null}
   */
  static #settingsService = null;

  /**
   * @private
   * @type {UserActivityService | null}
   */
  static #userActivityService = null;

  /**
   * @private
   * @type {UserService | null}
   */
  static #userService = null;

  /**
   * @private
   * @type {MongooseService | null}
   */
  static #mongooseService = null;

  /**
   * @private
   * @type {UserAuthenticationService | null}
   */
  static #userAuthenticationService = null;

  constructor() {}

  static get getCallHistoryService() {
    if (!ServiceFactory.#callHistoryService) {
      ServiceFactory.#callHistoryService = new CallHistoryService(CallHistory);
    }
    return ServiceFactory.#callHistoryService;
  }

  static get getContactService() {
    if (!ServiceFactory.#contactService) {
      ServiceFactory.#contactService = new ContactService(Contact);
    }
    return ServiceFactory.#contactService;
  }

  static get getMediaService() {
    if (!ServiceFactory.#mediaService) {
      ServiceFactory.#mediaService = new MediaService(Media);
    }
    return ServiceFactory.#mediaService;
  }

  static get getMessageService() {
    if (!ServiceFactory.#messageService) {
      ServiceFactory.#messageService = new MessageService(Message);
    }
    return ServiceFactory.#messageService;
  }

  static get getChatService() {
    if (!ServiceFactory.#chatService) {
      ServiceFactory.#chatService = new ChatService(Chat);
    }
    return ServiceFactory.#chatService;
  }

  static get getNotificationService() {
    if (!ServiceFactory.#notificationService) {
      ServiceFactory.#notificationService = new NotificationService(
        Notification
      );
    }
    return ServiceFactory.#notificationService;
  }

  static get getReactionService() {
    if (!ServiceFactory.#reactionService) {
      ServiceFactory.#reactionService = new ReactionService(Reaction);
    }
    return ServiceFactory.#reactionService;
  }

  static get getReportService() {
    if (!ServiceFactory.#reportService) {
      ServiceFactory.#reportService = new ReportService(Report);
    }
    return ServiceFactory.#reportService;
  }

  static get getSettingsService() {
    if (!ServiceFactory.#settingsService) {
      ServiceFactory.#settingsService = new SettingsService(Settings);
    }
    return ServiceFactory.#settingsService;
  }

  static get getUserActivityService() {
    if (!ServiceFactory.#userActivityService) {
      ServiceFactory.#userActivityService = new UserActivityService(
        UserActivity
      );
    }
    return ServiceFactory.#userActivityService;
  }

  static get getUserService() {
    if (!ServiceFactory.#userService) {
      ServiceFactory.#userService = new UserService(User);
    }
    return ServiceFactory.#userService;
  }

  static get getMongooseService() {
    if (!ServiceFactory.#mongooseService) {
      ServiceFactory.#mongooseService = new MongooseService();
    }
    return ServiceFactory.#mongooseService;
  }

  static get getUserAuthenticationService() {
    if (!ServiceFactory.#userAuthenticationService) {
      ServiceFactory.#userAuthenticationService = new UserAuthenticationService(
        UserAuthentication
      );
    }
    return ServiceFactory.#userAuthenticationService;
  }
}

module.exports = ServiceFactory;
