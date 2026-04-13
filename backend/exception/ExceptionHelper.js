const SignetixException = require("../exception/SignetixException");

class ExceptionHelper {
  static async validate(
    fieldToCheck,
    failStatusCode,
    message,
    response = null
  ) {
    if (fieldToCheck === undefined || fieldToCheck === null) {
      const signetixException = new SignetixException(
        failStatusCode,
        `${message}`
      );
      if (response) {
        return response
          .status(signetixException.status)
          .json(signetixException.loadResult());
      }
      return signetixException;
    }

    return null;
  }
}

module.exports = ExceptionHelper;
