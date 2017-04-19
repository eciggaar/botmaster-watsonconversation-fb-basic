const watson = require('watson-developer-cloud');
const config = require('../../config');
const watsonConversationStorageMiddleware = require('../watson_conversation_storage');
const watsonConversation = watson.conversation(config.watsonConversationCredentials);

const replyToUser = {
  type: 'incoming',
  name: 'reply-to-user',
  controller: (bot, update, next) => {
    bot.sendIsTypingMessageTo(update.sender.id, {ignoreMiddleware: true});

    console.log(JSON.stringify(update, null, 2));

    const messageForWatson = {
        context: update.session.context,
        workspace_id: process.env.WATSON_WORKSPACE_ID,
        input: {
            text: update.message.text,
        }
    };

    watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
        watsonConversationStorageMiddleware.updateSession(update.sender.id, watsonUpdate);
        const watsontext = watsonUpdate.output.text;
        bot.sendTextCascadeTo(watsontext, update.sender.id);
    });

    next();
  }
};

module.exports = {
  replyToUser
}
