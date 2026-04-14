/**
 * ManagerFactory takes on the responsibility of initializing and providing instances
 * of all the managers that are to be utilized throughout the application's runtime.
 */

const TwilioManager = require("../managers/twilio/twilioManager.js");
const JwtManager = require("../managers/jwt/jwtManager.js");

class ManagerFactory {
  //private fields

  /**
   * @private
   * @type {TwilioManager | null}
   */
  static #twilioManager = null;

  /**
   * @private
   * @type {JwtManager | null}
   */
  static #jwtManager = null;

  static getTwilioManager() {
    if (!ManagerFactory.#twilioManager) {
      ManagerFactory.#twilioManager = new TwilioManager();
    }
    return ManagerFactory.#twilioManager;
  }

  static getJwtManager() {
    if (!ManagerFactory.#jwtManager) {
      ManagerFactory.#jwtManager = new JwtManager();
    }
    return ManagerFactory.#jwtManager;
  }
}

module.exports = ManagerFactory;
