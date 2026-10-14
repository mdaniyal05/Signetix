const express = require("express");
const reactionRouter = express.Router();
const ReactionController = require("../controllers/ReactionController.js");

const reactionController = new ReactionController();

reactionRouter.get("/all", reactionController.getAllReactions);
reactionRouter.post("/toggle", reactionController.toggleReaction);
reactionRouter.get("/message/:messageId", reactionController.getReactionsByMessage);

module.exports = reactionRouter;
