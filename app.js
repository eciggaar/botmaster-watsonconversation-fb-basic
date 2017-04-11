const Botmaster = require('botmaster');
const MessengerBot = require('botmaster-messenger');
const { fulfillOutgoingWare } = require('botmaster-fulfill');
const actions = require('botmaster-fulfill-actions');
const config = require('./config');
const incomingMiddleware = require('./middleware/incoming');
const watsonConversationStorageMiddleware = require('./middleware/watson_conversation_storage');

// Initialize messenger bot
messengerBot = new MessengerBot(config.messengerCredentials);

// Define botmaster and add different bottypes (in this case only messenger)
const botmaster = new Botmaster(config.botmasterSettings);

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

botmaster.on('listening', (message) => { console.log(message); });
botmaster.on('error', (bot, err) => { console.log(err.stack); });
