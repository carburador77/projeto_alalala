const path = require('path');

const databaseFile = path.resolve(__dirname, 'db', 'database.sqlite');

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: databaseFile
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'migrations')
  }
};
