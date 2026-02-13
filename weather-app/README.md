# Node.js Weather Logger - Beginner Tutorial

A beginner-friendly project demonstrating Node.js core concepts: Event Loop, Non-blocking I/O, Core Modules, and NPM.

## 📚 Concepts Covered

### 1. Node.js Architecture
- **Event Loop**: How Node.js handles asynchronous operations without blocking
- **Non-blocking I/O**: File operations and HTTP requests that don't halt execution

### 2. Core Modules
- **fs (File System)**: Reading and writing files asynchronously
- **http**: Creating a web server to handle requests

### 3. NPM (Node Package Manager)
- **package.json**: Project configuration and dependency management
- **Third-party modules**: Using axios for HTTP requests

## 🚀 Setup Instructions

### Step 1: Initialize Project (Already Done)
```bash
npm init -y
```
This creates `package.json` which tracks your project metadata and dependencies.

### Step 2: Install Dependencies (Already Done)
```bash
npm install axios
```
Axios is a popular HTTP client for making API requests.

### Step 3: Run the Application

#### Option A: Fetch Weather Data Only
```bash
node fetchWeather.js
```

#### Option B: Start the Web Server
```bash
node server.js
```
Then visit: http://localhost:3000/

## 📖 How It Works

### Event Loop Explanation

```
┌───────────────────────────┐
│   Your Code Executes      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Async Operation Starts  │
│   (HTTP request, file I/O)│
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Event Loop Continues    │
│   (doesn't wait!)         │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Operation Completes     │
│   Callback Added to Queue │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Callback Executes       │
└───────────────────────────┘
```

### File Structure

- **fetchWeather.js**: Fetches weather data using axios and saves it using fs
- **server.js**: HTTP server that displays the weather log
- **weather_log.txt**: Stores weather data (created automatically)
- **package.json**: Project configuration

## 🌐 API Routes

- `http://localhost:3000/` - View weather log
- `http://localhost:3000/fetch` - Fetch new weather data

## 🔍 Key Learning Points

1. **Asynchronous Operations**: axios.get() and fs.appendFile() don't block
2. **Callbacks**: Functions executed when async operations complete
3. **Promises**: Modern way to handle async operations (.then/.catch)
4. **Event Loop**: Keeps Node.js responsive while waiting for I/O
5. **Modules**: require() to import built-in and third-party modules

## 🎯 Try These Exercises

1. Add error handling for network failures
2. Fetch weather for different cities
3. Add a route to clear the weather log
4. Use async/await instead of .then/.catch
5. Add timestamps to server logs

## 📦 Dependencies

- **axios**: ^1.13.5 - HTTP client for API requests

## 🌤️ Weather API

Uses [Open-Meteo](https://open-meteo.com/) - a free weather API (no API key required!)
