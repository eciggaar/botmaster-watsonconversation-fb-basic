const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const watsonConversationStorageMiddleware = require('..//watson_conversation_storage');

// Settings for Watson conversation service
const watsonConversation = watson.conversation({
    username: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_USERNAME : appEnv.getServiceCreds('conversation-service-basic').username,
    password: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_PASSWORD : appEnv.getServiceCreds('conversation-service-basic').password,
    version: 'v1',
    version_date: '2017-02-03',
});

const replyToUser = {
  type: 'incoming',
  name: 'reply-to-user',
  controller: (bot, update, next) => {
    bot.sendIsTypingMessageTo(update.sender.id, {ignoreMiddleware: true});

    console.log(JSON.stringify(update));

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
