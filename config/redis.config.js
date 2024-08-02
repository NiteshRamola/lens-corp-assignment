const Redis = require('ioredis');

const redis = new Redis({}); // default localhost:6379

redis.on('connect', () => {
  logger.log('Connected to Redis');
});

module.exports = redis;
