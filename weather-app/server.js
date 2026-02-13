// server.js - HTTP Server demonstrating Event Loop & Non-blocking I/O

const http = require('http');
const fs = require('fs');
const { fetchWeatherData } = require('./fetchWeather');

const PORT = 3000;

/**
 * HTTP MODULE - Creating a Web Server
 * The http.createServer() creates a server that listens for requests.
 * Each request is handled asynchronously by the Event Loop.
 * Multiple requests can be processed without blocking each other.
 */

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  // Route: Home page - displays weather log
  if (req.url === '/' || req.url === '/weather') {
    
    /**
     * EVENT LOOP IN ACTION:
     * fs.readFile is asynchronous - it doesn't block other incoming requests.
     * While reading the file, the Event Loop can handle other requests.
     * The callback executes when file reading completes.
     */
    fs.readFile('weather_log.txt', 'utf8', (err, data) => {
      if (err) {
        // If file doesn't exist yet, show a friendly message
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Weather App</title></head>
            <body style="font-family: Arial; padding: 20px;">
              <h1>Weather Logger</h1>
              <p>No weather data yet. Visit <a href="/fetch">/fetch</a> to get weather data.</p>
            </body>
          </html>
        `);
      } else {
        // Display the weather log
        const formattedData = data.split('\n').filter(line => line).join('<br>');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Weather App</title></head>
            <body style="font-family: Arial; padding: 20px;">
              <h1>Weather Log</h1>
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
                ${formattedData || 'No data available'}
              </div>
              <br>
              <a href="/fetch" style="padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Fetch New Weather Data</a>
            </body>
          </html>
        `);
      }
    });

  } 
  // Route: Fetch new weather data
  else if (req.url === '/fetch') {
    
    /**
     * PROMISE-BASED ASYNC OPERATION:
     * fetchWeatherData() returns a Promise.
     * The Event Loop doesn't wait - it continues handling other requests.
     * When the Promise resolves, the .then() callback is executed.
     */
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html><body style="font-family: Arial; padding: 20px;"><h1>Fetching weather...</h1>');
    
    fetchWeatherData()
      .then(weatherData => {
        res.write(`
          <p>SUCCESS: Weather data fetched and saved!</p>
          <p><strong>Temperature:</strong> ${weatherData.temperature}°C</p>
          <p><strong>Wind Speed:</strong> ${weatherData.windspeed} km/h</p>
          <p><a href="/">View Weather Log</a></p>
          </body></html>
        `);
        res.end();
      })
      .catch(error => {
        res.write(`<p>ERROR: ${error.message}</p></body></html>`);
        res.end();
      });

  } 
  // Route: 404 Not Found
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
  }
});

/**
 * SERVER LISTENING - Event Loop keeps the process alive
 * The server.listen() tells Node.js to keep the Event Loop running.
 * It continuously listens for incoming connections without blocking.
 */
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Visit http://localhost:${PORT}/ to view weather log`);
  console.log(`Visit http://localhost:${PORT}/fetch to fetch new weather data`);
});
