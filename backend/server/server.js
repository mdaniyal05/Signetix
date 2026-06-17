require("dotenv").config();
require("reflect-metadata");

const express = require("express");
const http = require("http");

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
  } catch (exception) {
    LoggerFactory.getApplicationLogger.error(`Exception Occured ${exception}`);

    throw new Error(exception);
  }
}

function setupRoutes() {
  try {
    const SignetixApp = express();

    SignetixApp.use(express.json());
    SignetixApp.use(express.urlencoded({ extended: true }));

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
    SignetixApp.use("/twilio", twilioOtpRoutes);
    SignetixApp.use("/amazon", amazonS3Routes);
    SignetixApp.use("/jwt", jwtRoutes);
    SignetixApp.use("/auth", authRoutes);

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
