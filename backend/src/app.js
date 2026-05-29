const { startServer } = require('../app');

if (require.main === module) {
  startServer();
}

module.exports = require('../app');
