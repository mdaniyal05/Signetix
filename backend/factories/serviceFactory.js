/**
 * ServiceFactory takes on the responsibility of initializing and providing instances
 * of all database-esque services. Since these services are stateless, factory pattern
 * serves as a nuanced approach to mitigate the issue of creating redundant instances across different scripts.
 */

//services
const UserActivityService = require("../services/UserActivityService.js");
const UserService = require("../services/UserService.js");
const UserAuthenticationService = require("../services/UserAuthenticationService.js");
const MongooseService = require("../services/MongooseService.js");

//models
const User = require("../models/User.js");
const UserActivity = require("../models/UserActivity.js");
const UserAuthentication = require("../models/UserAuthentication.js");

class ServiceFactory {
  //private fields
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
