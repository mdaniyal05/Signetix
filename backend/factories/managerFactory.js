/**
 * ManagerFactory takes on the responsibility of initializing and providing instances
 * of all the managers that are to be utilized throughout the application's runtime.
 */

const AwsS3Manager = require("../managers/Aws/awsS3Manager.js");
const TwilioManager = require("../managers/twilio/twilioManager.js");
const JwtManager = require("../managers/jwt/jwtManager.js");

class ManagerFactory {
  /**
   * @private
   * @type {AwsS3Manager | null}
   */
  static #awsS3Manager = null;

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

  static getAwsS3Manager() {
    if (!ManagerFactory.#awsS3Manager) {
      ManagerFactory.#awsS3Manager = new AwsS3Manager();
    }
    return ManagerFactory.#awsS3Manager;
  }

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
