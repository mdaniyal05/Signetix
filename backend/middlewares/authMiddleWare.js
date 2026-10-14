const SignetixException = require("../exception/SignetixException.js");
const LoggerFactory = require("../factories/loggerFactory.js");
const AuthConstants = require("./constants/authConstants.js");
const ManagerFactory = require("../factories/managerFactory.js");

class AuthMiddleWare {
  #excludedPaths = null;

  constructor() {
    // Only unauthenticated flows (signup, login, token refresh, OTP) are exempt.
    this.#excludedPaths = [
      AuthConstants.AUTH_USERS_CREATE,
      AuthConstants.AUTH_USERS_LOGIN,
      AuthConstants.JWT_REFRESH,
      AuthConstants.TWILIO_GET,
      AuthConstants.TWILIO_VERIFY,
      AuthConstants.RESEND_GET,
      AuthConstants.RESEND_VERIFY,
    ];
  }

  async authenticate(request, response, next) {
    if (this.#excludedPaths.some((path) => request.path.includes(path))) {
      LoggerFactory.getApplicationLogger.info(`Skipping Path: ${request.path}`);
      return next();
    }

    const authenticationHeader =
      request.headers[AuthConstants.AUTHORIZATION_HEADER];

    if (authenticationHeader == null || authenticationHeader == undefined) {
      const signetixException = new SignetixException(
        403,
        "Authorization header is missing!"
      );

      return response
        .status(signetixException.status)
        .json(signetixException.loadResult());
    }

    const token = await this.#retrieveToken(authenticationHeader);

    const accessTokenVerification =
      await ManagerFactory.getJwtManager().verifyAccessToken(token);

    if (accessTokenVerification.exception) {
      return response.status(AuthConstants.UNAUTHORIZED).json({
        exception: accessTokenVerification.exception,
        customMessage: `Either login again, or refresh the access token by sending refresh token to the endpoint jwt/refresh`,
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    LoggerFactory.getApplicationLogger.info(
      `Access token is valid: ${JSON.stringify(accessTokenVerification)}`
    );
    // Expose the authenticated identity so controllers can enforce ownership.
    request.authUserId = accessTokenVerification.data?.userId ?? null;
    //the validation is done - move to the next one
    next();
  }

  async #retrieveToken(authenticationHeader) {
    const authArray = authenticationHeader.split(" ");
    return authArray.length > 1
      ? authArray[AuthConstants.FIRST]
      : authArray[AuthConstants.ZERO];
  }
}

module.exports = AuthMiddleWare;
