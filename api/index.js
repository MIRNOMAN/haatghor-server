const { register } = require('tsx/cjs/api');

// Vercel executes a JavaScript handler. tsx transpiles the existing TypeScript
// Express app without starting the long-running local HTTP/WebSocket server.
register();
module.exports = require('../src/app').default;
