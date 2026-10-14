const ServiceFactory = require("../factories/serviceFactory.js");
const ExceptionHelper = require("../exception/ExceptionHelper.js");

const REACTION_TYPES = ["like", "love", "laugh"];

class ReactionController {
  constructor() {}

  //Get all Reactions
  getAllReactions = async (request, response) => {
    try {
      const reactions = await ServiceFactory.getReactionService.getDocuments();

      response.json(reactions);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Get single Reaction
  getReactionById = async (request, response) => {
    try {
      const reactionId = request.params.id;

      const reaction =
        await ServiceFactory.getReactionService.getDocumentById(reactionId);

      response.json(reaction);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Get the reactions on a single message
  getReactionsByMessage = async (request, response) => {
    try {
      const reactions =
        await ServiceFactory.getReactionService.getDocumentsByCustomFilters({
          messageId: request.params.messageId,
        });

      response.json(reactions);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Toggle a reaction: same type removes it, a different type replaces it, none adds it.
  toggleReaction = async (request, response) => {
    try {
      const userPhoneNumberValidation = await ExceptionHelper.validate(
        request.body.userPhoneNumber,
        400,
        `userPhoneNumber is required!`,
        response
      );
      if (userPhoneNumberValidation) return userPhoneNumberValidation;

      const messageIdValidation = await ExceptionHelper.validate(
        request.body.messageId,
        400,
        `messageId is not provided!`,
        response
      );
      if (messageIdValidation) return messageIdValidation;

      if (!REACTION_TYPES.includes(request.body.type)) {
        return response
          .status(400)
          .json({ error: `type must be one of: ${REACTION_TYPES.join(", ")}` });
      }

      const user =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: request.body.userPhoneNumber,
        });

      const userValidation = await ExceptionHelper.validate(
        user,
        400,
        `userPhoneNumber doesn't exist in the user table!`,
        response
      );
      if (userValidation) return userValidation;

      const message = await ServiceFactory.getMessageService.getDocumentById(
        request.body.messageId
      );

      const messageValidation = await ExceptionHelper.validate(
        message,
        400,
        `Message doesn't exist!`,
        response
      );
      if (messageValidation) return messageValidation;

      const existing =
        await ServiceFactory.getReactionService.getDocumentByCustomFilters({
          messageId: message._id,
          userId: user._id,
        });

      if (existing && existing.type === request.body.type) {
        await ServiceFactory.getReactionService.deleteDocumentById(existing._id);
      } else if (existing) {
        await ServiceFactory.getReactionService.updateDocument(
          { _id: existing._id },
          { type: request.body.type }
        );
      } else {
        await ServiceFactory.getReactionService.saveDocument({
          messageId: message._id,
          userId: user._id,
          type: request.body.type,
        });
      }

      const reactions =
        await ServiceFactory.getReactionService.getDocumentsByCustomFilters({
          messageId: message._id,
        });

      response.json({ messageId: message._id.toString(), reactions });
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };
}

module.exports = ReactionController;
