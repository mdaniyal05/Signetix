require("dotenv").config();

const { Resend } = require("resend");
const ResendConfig = require("./models/ResendConfig.js");
const LoggerFactory = require("../../factories/loggerFactory.js");

class ResendManager {
  /**
   * @type {ResendConfig | null}
   */
  #resendConfigDto = null;

  /**
   * @type {Resend | null}
   */
  #resendClient = null;

  constructor() {
    this.#initializeResendClient();
  }

  #initializeResendClient() {
    LoggerFactory.getApplicationLogger.info(`Initializing Resend client...`);

    if (
      process.env.RESEND_API_KEY == null ||
      process.env.RESEND_FROM_EMAIL == null
    ) {
      LoggerFactory.getApplicationLogger.error(
        `One or more environment variables are not set: {RESEND_API_KEY} {RESEND_FROM_EMAIL} -- kindly check!`
      );

      return;
    }

    this.#resendConfigDto = new ResendConfig(
      process.env.RESEND_API_KEY,
      process.env.RESEND_FROM_EMAIL
    );

    this.#resendClient = new Resend(this.#resendConfigDto.apiKey);
  }

  get getResendClient() {
    return this.#resendClient;
  }

  // Emails a one-time code; returns the Resend send result (throws on transport error).
  async sendOtpEmail(toEmail, otpCode, name = "there") {
    return this.#resendClient.emails.send({
      from: this.#resendConfigDto.fromEmail,
      to: toEmail,
      subject: "Your Signetix verification code",
      html: `<p>Hi ${name},</p><p>Your Signetix verification code is <strong style="font-size:20px">${otpCode}</strong>.</p><p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    });
  }
}

module.exports = ResendManager;
