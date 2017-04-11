const request = require('request-promise');
const config = require('../../config');

const addWeatherInfoToUpdate = {
  type: 'incoming',
  name: 'add-weather-to-update',
  controller: (bot, update, next) => {

    let weatherUrl = config.weatherCredentials.host;
    weatherUrl = 'https://' + weatherUrl + '/api/weather/v1/geocode/52.34/4.83/forecast/daily/3day.json?units=m';

    const requestOptions = {
        // Get daily forcasts for the next three days based for the location Amsterdam
        url: weatherUrl,
        auth: {
            user: config.weatherCredentials.username,
            pass: config.weatherCredentials.password
        },
        json: true,
    }

    if (typeof update.session.context.weather === 'undefined') {
        request(requestOptions)
            .then((body) => {
                update.session.context.weather = {};
                update.session.context.weather.narrative = body.forecasts[0].narrative;
                next();
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
      next();
    }
  }
}

module.exports = {
  addWeatherInfoToUpdate
}
