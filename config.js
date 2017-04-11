const cfenv = require('cfenv');
const dotenv = require('dotenv');
const appEnv = cfenv.getAppEnv();

// Load environment variables from local .env when running locally. Otherwise use values from Bluemix
// environment variables
if (appEnv.isLocal) {
    dotenv.load();
}

// Expose botmaster port
const botmasterSettings = { port: appEnv.isLocal ? 3000 : appEnv.port };

// Set settings for Facebook messenger bot
const messengerCredentials = {
    credentials: {
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
        pageToken: process.env.FACEBOOK_PAGE_TOKEN,
        fbAppSecret: process.env.FACEBOOK_APP_SECRET,
    },
    // !! see Readme if you have any issues with understanding webhooks
    webhookEndpoint: 'webhook',
};

// Settings for Watson conversation service
const watsonConversationCredentials = {
    username: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_USERNAME : appEnv.getServiceCreds('conversation-service-basic').username,
    password: (appEnv.isLocal) ? process.env.WATSON_CONVERSATION_PASSWORD : appEnv.getServiceCreds('conversation-service-basic').password,
    version: 'v1',
    version_date: '2017-02-03',
};

// Settings for IBM Weather Company Data service
const weatherCredentials = {
    username: (appEnv.isLocal) ? process.env.WEATHER_USERNAME : appEnv.getServiceCreds('weather-service-basic').username,
    password: (appEnv.isLocal) ? process.env.WEATHER_PASSWORD : appEnv.getServiceCreds('weather-service-basic').password,
    host: (appEnv.isLocal) ? process.env.WEATHER_HOST : appEnv.getServiceCreds('weather-service-basic').host
};

module.exports = {
  botmasterSettings,
  messengerCredentials,
  watsonConversationCredentials,
  weatherCredentials
}
