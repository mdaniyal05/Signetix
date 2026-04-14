/**
 * ControllerFactory takes on the responsibility of initializing and providing instances
 * of all the controllers that are to be utilized throughout the application's runtime.
 */

//controllers
const UserController = require("../controllers/UserController.js");
const UserActivityController = require("../controllers/UserActivityController.js");
const UserAuthenticationController = require("../controllers/UserAuthenticationController.js");
const TwilioOtpController = require("../controllers/TwilioOtpController.js");
const JwtController = require("../controllers/JwtController.js");

class ControllerFactory {
  /**
   * @private
   * @type {UserController | null}
   */
  static #userController = null;

  /**
   * @private
   * @type {UserActivityController | null}
   */
  static #userActivityController = null;

  /**
   * @private
   * @type {UserAuthenticationController | null}
   */
  static #userAuthenticationController = null;

  /**
   * @private
   * @type {TwilioOtpController | null}
   */
  static #twilioOtpController = null;

  /**
   * @private
   * @type {JwtController | null}
   */
  static #jwtController = null;

  constructor() {}

  static getUserController() {
    if (!ControllerFactory.#userController) {
      ControllerFactory.#userController = new UserController();
    }
    return ControllerFactory.#userController;
  }

  static getUserActivitiyController() {
    if (!ControllerFactory.#userActivityController) {
      ControllerFactory.#userActivityController = new UserActivityController();
    }
    return ControllerFactory.#userActivityController;
  }

  static getUserAuthenticationController() {
    if (!ControllerFactory.#userAuthenticationController) {
      ControllerFactory.#userAuthenticationController =
        new UserAuthenticationController();
    }
    return ControllerFactory.#userAuthenticationController;
  }

  static getTwilioOtpController() {
    if (!ControllerFactory.#twilioOtpController) {
      ControllerFactory.#twilioOtpController = new TwilioOtpController();
    }
    return ControllerFactory.#twilioOtpController;
  }

  static getJwtController() {
    if (!ControllerFactory.#jwtController) {
      ControllerFactory.#jwtController = new JwtController();
    }
    return ControllerFactory.#jwtController;
  }
}

module.exports = ControllerFactory;
