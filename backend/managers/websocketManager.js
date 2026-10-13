const socketIo = require("socket.io");
const MeetingSocket = require("../webSockets/meetingSocket.js");
const MessageSocket = require("../webSockets/messageSocket.js");
const LoggerFactory = require("../factories/loggerFactory.js");
const Socket = require("../webSockets/socket.js");

class WebSocketManager {
  constructor(server) {
    // Match the REST allowlist (CORS_ALLOWED_ORIGINS); "*" only when none is set.
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.signetixSocketIo = socketIo(server, {
      cors: { origin: allowedOrigins.length > 0 ? allowedOrigins : "*" },
    });

    this.userSocketMap = new Map();
    this.callSocketMap = new Map();
    this.meetingParticipantMap = new Map();
    this.onlineUsers = new Set(); // phone numbers currently connected

    this.setupSocketEvents(
      this.userSocketMap,
      this.callSocketMap,
      this.meetingParticipantMap
    );
  }

  setupSocketEvents(userSocketMap, callSocketMap, meetingParticipantMap) {
    this.signetixSocketIo.on("connection", (socket) => {
      this.socket = new Socket(socket, userSocketMap);
      this.messageSocket = new MessageSocket(socket, userSocketMap);
      this.meetingSocket = new MeetingSocket(
        socket,
        userSocketMap,
        callSocketMap,
        meetingParticipantMap
      );

      this.presenceEvents(socket);

      //global disconnect event
      this.socketDisconnectEvent(
        socket,
        userSocketMap,
        callSocketMap,
        meetingParticipantMap
      );
    });
  }

  // Online/offline presence: broadcast on register/disconnect, send the current list on join.
  presenceEvents(socket) {
    socket.on("socket-registration", (data) => {
      const phoneNumber = data?.userPhoneNumber;
      if (phoneNumber == null) return;

      socket.data.userPhoneNumber = phoneNumber;
      this.onlineUsers.add(phoneNumber);

      socket.emit("presence-state", { online: [...this.onlineUsers] });
      socket.broadcast.emit("presence-update", { phoneNumber, online: true });
    });

    socket.on("presence-request", () => {
      socket.emit("presence-state", { online: [...this.onlineUsers] });
    });
  }

  socketDisconnectEvent(
    socket,
    userSocketMap,
    callSocketMap,
    meetingParticipantMap
  ) {
    socket.on("disconnect", () => {
      const disconnectedUserSocketId = socket.id;
      LoggerFactory.getApplicationLogger.info(
        `Socket with id ${disconnectedUserSocketId} disconnected`
      );

      this.meetingSocket.participantDisconnectEvent(
        this.signetixSocketIo,
        disconnectedUserSocketId,
        userSocketMap,
        callSocketMap,
        meetingParticipantMap
      );

      // Mark the user offline and tell everyone else.
      const phoneNumber = socket.data?.userPhoneNumber;
      if (phoneNumber != null) {
        this.onlineUsers.delete(phoneNumber);
        userSocketMap.delete(phoneNumber);
        socket.broadcast.emit("presence-update", {
          phoneNumber,
          online: false,
        });
      }
    });
  }
}

module.exports = WebSocketManager;
