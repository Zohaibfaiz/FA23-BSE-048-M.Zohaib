'use strict';

// config/server.js
// Central place for server configuration.
// Keeping config separate makes the app easier to test, deploy, and scale.

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  NODE_ENV,
};
