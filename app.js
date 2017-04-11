const Botmaster = require('botmaster');
const MessengerBot = require('botmaster-messenger');
const cfenv = require('cfenv');
const dotenv = require('dotenv');
const {fulfillOutgoingWare} = require('botmaster-fulfill');
const actions = require('botmaster-fulfill-actions');
const appEnv = cfenv.getAppEnv();

// Load environment variables from local .env when running locally. Otherwise use values from Bluemix
// environment variables
if (appEnv.isLocal) {
    dotenv.load();
}

const incomingMiddleware = require('./middleware/incoming');
const watsonConversationStorageMiddleware = require('./middleware/watson_conversation_storage');

// Set settings for Facebook messenger bot
const messengerSettings = {
    credentials: {
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
        pageToken: process.env.FACEBOOK_PAGE_TOKEN,
        fbAppSecret: process.env.FACEBOOK_APP_SECRET,
    },
    // !! see Readme if you have any issues with understanding webhooks
    webhookEndpoint: 'webhook',
};

// Initialize messenger bot
messengerBot = new MessengerBot(messengerSettings);

const botmasterSettings = {
    port: appEnv.isLocal ? 3000 : appEnv.port,
};

// Define botmaster and add different bottypes (in this case only messenger)
const botmaster = new Botmaster(botmasterSettings);

botmaster.addBot(messengerBot);

// Incoming middleware for botmaster to perform middleware tasks before update handler is entered.
botmaster.use({
  type: 'incoming',
  name: 'retrieveSession',
  controller: watsonConversationStorageMiddleware.retrieveSession
});

botmaster.use(incomingMiddleware.weather.addWeatherInfoToUpdate);
botmaster.use(incomingMiddleware.userInfo.addUserInfoToUpdate);
botmaster.use(incomingMiddleware.reply.replyToUser);


// Botmaster outgoing middleware handlers
botmaster.use({
  type: 'outgoing',
  name: 'fulfill-middleware',
  controller: fulfillOutgoingWare({actions})
});

botmaster.on('listening', (message) => {
    console.log(message);
});

botmaster.on('error', (bot, err) => {
    console.log(err.stack);
});
