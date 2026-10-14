require("dotenv").config();
require("reflect-metadata");

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const WebSocketManager = require("../managers/websocketManager.js");
const EventFactory = require("../factories/eventFactory.js");
const ManagerFactory = require("../factories/managerFactory.js");
const MessageEvent = require("../events/services/messageEvent.js");
const AccessibilitySettingsEvent = require("../events/services/accessibilitySettingsEvent.js");
const UserAuthenticationEvent = require("../events/services/userAuthenticationEvent.js");
const UserEvent = require("../events/services/userEvent.js");
const ChatEvent = require("../events/services/chatEvent.js");
const CallLogEvent = require("../events/services/callLogEvent.js");
const ServiceFactory = require("../factories/serviceFactory.js");
const CommonUtils = require("../utilities/commonUtils.js");
const ServerConstants = require("../constants/serverConstants.js");
const LoggerFactory = require("../factories/loggerFactory.js");
const TwilioAdmin = require("../managers/twilio/models/TwilioAdmin.js");
const AuthMiddleWare = require("../middlewares/authMiddleWare.js");

//routes
const userRoutes = require("../routes/UserRoutes.js");
const homeRoutes = require("../routes/HomeRoute.js");
const contactRoutes = require("../routes/ContactRoutes.js");
const chatRoutes = require("../routes/ChatRoutes.js");
const messageRoutes = require("../routes/MessageRoutes.js");
const callHistoryRoutes = require("../routes/CallHistoryRoutes.js");
const settingsRoutes = require("../routes/SettingsRoutes.js");
const userAuthenticationRoutes = require("../routes/UserAuthenticationRoutes.js");
const twilioOtpRoutes = require("../routes/TwilioVerifyRoutes.js");
const amazonS3Routes = require("../routes/AmazonS3Routes.js");
const jwtRoutes = require("../routes/JwtRoutes.js");
const authRoutes = require("../routes/AuthRoutes.js");
const cloudinaryRoutes = require("../routes/CloudinaryRoutes.js");
const resendVerifyRoutes = require("../routes/ResendVerifyRoutes.js");
const reactionRoutes = require("../routes/ReactionRoutes.js");
const reportRoutes = require("../routes/ReportRoutes.js");
const notificationRoutes = require("../routes/NotificationRoutes.js");

const mongoDburl = process.env.MONGO_DB_URL;
const port = process.env.PORT;

//setup system
setupSystem();

//routes
const SignetixApp = setupRoutes();

//setup Server
const mainServer = http.createServer(SignetixApp);

//connect to the database
ServiceFactory.getMongooseService.connectToMongoDB(mongoDburl);

mainServer.listen(port, async () => {
  await CommonUtils.waitForVariableToBecomeNonNull(getApplicationLogger);

  LoggerFactory.getApplicationLogger.info(
    `Signetix Server is Up & Running on http://localhost:${port}`
  );

  const websocketManager = new WebSocketManager(mainServer);
});

async function setupSystem() {
  try {
    await setupApplicationLogger(ServerConstants.LOG_LEVEL_DEBUG);

    //setup message event
    EventFactory.setMessageEvent = new MessageEvent();
    EventFactory.setAccessibilitySettingsEvent =
      new AccessibilitySettingsEvent();
    EventFactory.setUserEvent = new UserEvent();
    EventFactory.setUserAuthenticationEvent = new UserAuthenticationEvent();
    EventFactory.setCallLogEvent = new CallLogEvent();
    EventFactory.setChatEvet = new ChatEvent();

    //setup Amazon S3 Manager
    //dont await, let it run on a separate thread
    //as it wont be needed immediately
    // await ManagerFactory.getAwsS3Manager().initiateS3Connection();

    //Twilio OTP/Verify
    // await setupTwilio();

    //Jwt Manager
    await setupJwtManager();

    //Media (Cloudinary) + email OTP (Resend) + web-push providers — self-configure from env.
    ManagerFactory.getCloudinaryManager();
    ManagerFactory.getResendManager();
    ManagerFactory.getNotificationPushManager();
  } catch (exception) {
    LoggerFactory.getApplicationLogger.error(`Exception Occured ${exception}`);

    throw new Error(exception);
  }
}

function setupRoutes() {
  try {
    const SignetixApp = express();

    // Production hardening: don't advertise Express, trust the platform proxy (Render).
    SignetixApp.disable("x-powered-by");
    SignetixApp.set("trust proxy", 1);

    // Security headers (HSTS, no-sniff, frame denial, etc.).
    SignetixApp.use(helmet());

    // CORS for REST: allowlist via CORS_ALLOWED_ORIGINS (comma-separated); if unset,
    // reflect the request origin (dev convenience).
    SignetixApp.use(cors(buildCorsOptions()));

    SignetixApp.use(express.json({ limit: "1mb" }));
    SignetixApp.use(express.urlencoded({ extended: true, limit: "1mb" }));

    // Strip NoSQL-injection operators ($ / .) from request input before it hits Mongoose.
    SignetixApp.use(sanitizeRequest);

    // Rate limiting: lenient global cap (skips the health-check root), stricter on
    // auth + OTP (brute-force / abuse).
    SignetixApp.use(buildRateLimiter(15 * 60 * 1000, 600, true));
    const authLimiter = buildRateLimiter(15 * 60 * 1000, 30);
    const otpLimiter = buildRateLimiter(15 * 60 * 1000, 10);

    SignetixApp.get("/", (req, res) => {
      res.status(200);
      res.send("Hello, Welcome to Signetix!");
    });

    //auth middleware
    const authMiddleWare = new AuthMiddleWare();

    SignetixApp.use(async (request, response, next) => {
      await authMiddleWare.authenticate(request, response, next);
    });

    // SignetixApp.use("/", homeRoutes);
    SignetixApp.use("/users", userRoutes);
    SignetixApp.use("/contacts", contactRoutes);
    SignetixApp.use("/chats", chatRoutes);
    SignetixApp.use("/messages", messageRoutes);
    SignetixApp.use("/callHistory", callHistoryRoutes);
    SignetixApp.use("/settings", settingsRoutes);
    SignetixApp.use("/userAuthentication", userAuthenticationRoutes);
    SignetixApp.use("/twilio", otpLimiter, twilioOtpRoutes);
    SignetixApp.use("/amazon", amazonS3Routes);
    SignetixApp.use("/jwt", authLimiter, jwtRoutes);
    SignetixApp.use("/auth", authLimiter, authRoutes);
    SignetixApp.use("/cloudinary", cloudinaryRoutes);
    SignetixApp.use("/resend", otpLimiter, resendVerifyRoutes);
    SignetixApp.use("/reactions", reactionRoutes);
    SignetixApp.use("/reports", reportRoutes);
    SignetixApp.use("/notifications", notificationRoutes);

    return SignetixApp;
  } catch (exception) {
    LoggerFactory.getApplicationLogger.error(`Exception Occured ${exception}`);

    throw new Error(exception);
  }
}

async function setupTwilio() {
  await ManagerFactory.getTwilioManager().initializeTwilioClient(
    new TwilioAdmin(
      process.env.TWILIO_ACCOUNT_SID_ENCRYPTED,
      process.env.TWILIO_ACCOUNT_AUTH_TOKEN_ENCRYPTED
    )
  );

  await ManagerFactory.getTwilioManager().setTwilioVerifyServiceDto(
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

async function setupJwtManager() {
  await ManagerFactory.getJwtManager().setJwtDto(
    await CommonUtils.decodeFromBase64(
      process.env.JWT_SECRET_ACCESS_TOKEN_SECRET_KEY_ENCRYPTED
    ),
    await CommonUtils.decodeFromBase64(
      process.env.JWT_SECRET_REFRESH_TOKEN_SECRET_KEY
    ),
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_IN_DAYS,
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_IN_DAYS
  );
}

async function setupApplicationLogger(logLevel) {
  const logger = await CommonUtils.getLogger(logLevel);
  console.log("Setting logger;");
  LoggerFactory.setApplicationLogger = logger;
}

function getApplicationLogger() {
  return LoggerFactory.getApplicationLogger;
}

// Rate limiter factory (per-IP; trust-proxy is set so req.ip is the real client).
function buildRateLimiter(windowMs, max, skipHealthCheck = false) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipHealthCheck ? (request) => request.path === "/" : undefined,
    message: {
      exception: "Too many requests, please try again later.",
      code: "RATE_LIMITED",
    },
  });
}

// Defensive NoSQL-injection guard: drop any Mongo operator keys ($… or with a dot)
// from mutable request input so a body like { phoneNumber: { $gt: "" } } can't match.
function sanitizeRequest(request, response, next) {
  stripOperators(request.body);
  stripOperators(request.params);
  next();
}

function stripOperators(value) {
  if (value == null || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
      continue;
    }
    stripOperators(value[key]);
  }
}

// REST CORS options: explicit allowlist always honoured. When unset, reflect the
// origin in dev (convenience) but BLOCK cross-origin in production (reflecting any
// origin with credentials is unsafe) — set CORS_ALLOWED_ORIGINS in prod.
function buildCorsOptions() {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length > 0) {
    return { origin: allowedOrigins, credentials: true };
  }

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    console.warn(
      "[security] CORS_ALLOWED_ORIGINS is not set in production — blocking cross-origin requests. Set it to your frontend origin(s)."
    );
  }
  return { origin: isProduction ? false : true, credentials: true };
}
