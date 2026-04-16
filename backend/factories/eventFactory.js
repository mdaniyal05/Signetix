/**
 * EventFactory takes on the responsibility of initializing and providing instances
 * of all the event classes that are to be utilized throughout the application's runtime.
 */

const UserAuthenticationEvent = require("../events/services/userAuthenticationEvent.js");
const UserEvent = require("../events/services/userEvent.js");

class EventFactory {
  //private fields

  /**
   * @private
   * @type {UserAuthenticationEvent | null}
   */
  static #userAuthenticationEvent = null;

  /**
   * @private
   * @type {UserEvent | null}
   */
  static #userEvent = null;

  static get getUserEvent() {
    return EventFactory.#userEvent;
  }

  static get getUserAuthenticationEvent() {
    return EventFactory.#userAuthenticationEvent;
  }

  /**
   * @param {(param: UserEvent) => void} value
   */
  static set setUserEvent(value) {
    EventFactory.#userEvent = value;
  }

  /**
   * @param {(param: UserAuthenticationEvent) => void} value
   */
  static set setUserAuthenticationEvent(value) {
    EventFactory.#userAuthenticationEvent = value;
  }
}

module.exports = EventFactory;
