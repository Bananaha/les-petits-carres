var config = {
  development: {
    //mongodb connection settings
    database: {
      host: 'localhost',
      port: '27017',
      db: 'littleSquares'
    },
    //server details
    server: {
      port: '5000'
    }
  }
};
module.exports = config;
