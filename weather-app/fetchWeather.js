// fetchWeather.js - Demonstrates Asynchronous Operations & Event Loop

const axios = require('axios');
const fs = require('fs');

/**
 * EVENT LOOP EXPLANATION:
 * When this function runs, axios.get() is asynchronous and non-blocking.
 * The Event Loop delegates the HTTP request to the system's network API,
 * allowing Node.js to continue executing other code without waiting.
 * When the response arrives, the callback (then/catch) is added to the Event Loop's queue.
 */

function fetchWeatherData() {
  console.log('Fetching weather data...');
  
  // Open-Meteo API - Free weather API (no key required)
  // Coordinates for New York City
  const latitude = 40.7128;
  const longitude = -74.0060;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  // PROMISE-BASED ASYNC OPERATION
  // This doesn't block - the Event Loop continues while waiting for the response
  return axios.get(url)
    .then(response => {
      const weatherData = response.data.current_weather;
      
      // Format the weather information
      const weatherInfo = {
        timestamp: new Date().toISOString(),
        temperature: weatherData.temperature,
        windspeed: weatherData.windspeed,
        weathercode: weatherData.weathercode,
        location: 'New York City'
      };

      console.log('Weather data received:', weatherInfo);
      
      // Save to file using fs module (also asynchronous)
      saveWeatherToFile(weatherInfo);
      
      return weatherInfo;
    })
    .catch(error => {
      console.error('Error fetching weather:', error.message);
      throw error;
    });
}

/**
 * FILE SYSTEM MODULE (fs) - Non-blocking I/O
 * fs.appendFile is asynchronous - it doesn't block the Event Loop.
 * The file operation is handled by the system, and the callback
 * executes when the operation completes.
 */
function saveWeatherToFile(weatherData) {
  const logEntry = `[${weatherData.timestamp}] ${weatherData.location} - Temp: ${weatherData.temperature}°C, Wind: ${weatherData.windspeed} km/h\n`;
  
  // Asynchronous file write - doesn't block execution
  fs.appendFile('weather_log.txt', logEntry, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Weather data saved to weather_log.txt');
    }
  });
}

// Export for use in server
module.exports = { fetchWeatherData };

// Run if executed directly
if (require.main === module) {
  fetchWeatherData();
}
