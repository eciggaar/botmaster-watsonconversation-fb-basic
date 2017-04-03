const appEnv = require('cfenv').getAppEnv();
const request = require('request-promise');

const addWeatherInfoToUpdate = function addWeatherInfoToUpdate(bot, update, next) {
    let weatherUrl = (appEnv.isLocal) ? process.env.WEATHER_HOST : appEnv.getServiceCreds('weather-service-basic').host;
    weatherUrl = 'https://' + weatherUrl + '/api/weather/v1/geocode/52.34/4.83/forecast/daily/3day.json?units=m';

    const requestOptions = {
        // Get daily forcasts for the next three days based for the location Amsterdam
        url: weatherUrl,
        auth: {
            user: (appEnv.isLocal) ? process.env.WEATHER_USERNAME : appEnv.getServiceCreds('weather-service-basic').username,
            pass: (appEnv.isLocal) ? process.env.WEATHER_PASSWORD : appEnv.getServiceCreds('weather-service-basic').password
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

module.exports = {
    addWeatherInfoToUpdate, // using shorthand here
}
