const Botmaster = require('botmaster');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');
const dotenv = require('dotenv');
const request = require('request-promise');
const incomingMiddleware = require('./middleware/incoming');
const {fulfillOutgoingWare} = require('botmaster-fulfill');
const actions = require('botmaster-fulfill-actions');
const appEnv = cfenv.getAppEnv();

// Load environment variables from local .env when running locally. Otherwise use values from Bluemix
// environment variables
if (appEnv.isLocal) {
    dotenv.load();
}

// Variable used to keep state during the conversation
const watsonConversationStorageMiddleware = require('./middleware/watson_conversation_storage');

// Settings for Watson conversation service
const watsonConversation = watson.conversation({
    username: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_USERNAME : appEnv.getServiceCreds('conversation-service-basic').username,
    password: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_PASSWORD : appEnv.getServiceCreds('conversation-service-basic').password,
    version: 'v1',
    version_date: '2017-02-03',
});

// Set settings for Facebook messenger bot
const messengerSettings = {
    credentials: {
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
        pageToken: process.env.FACEBOOK_PAGE_TOKEN,
        fbAppSecret: process.env.FACEBOOK_APP_SECRET,
    },
    // !! see Readme if you have any issues with understanding webhooks
    webhookEndpoint: '/webhook',
};

// Initialize messenger bot
messengerBot = new Botmaster.botTypes.MessengerBot(messengerSettings);

const botmasterSettings = {
    port: appEnv.isLocal ? 3000 : appEnv.port,
};

// Define botmaster and add different bottypes (in this case only messenger)
const botmaster = new Botmaster(botmasterSettings);
botmaster.addBot(messengerBot);

// Incoming middleware for botmaster to perform middleware tasks before update handler is entered.
botmaster.use('incoming', watsonConversationStorageMiddleware.retrieveSession);
botmaster.use('incoming', incomingMiddleware.weather.addWeatherInfoToUpdate);
botmaster.use('incoming', {type: 'messenger'}, incomingMiddleware.userInfo.addUserInfoToUpdate);

botmaster.use('incoming', (bot, update, next) => {
    bot.sendIsTypingMessageTo(update.sender.id);
    next();
});

// Botmaster update handler.
botmaster.on('update', (bot, update) => {
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
});

// Botmaster outgoing middleware handlers
botmaster.use('outgoing', fulfillOutgoingWare( {actions} ));

botmaster.on('server running', (message) => {
    console.log(message);
});

botmaster.on('error', (bot, err) => {
    console.log(err.stack);
});
