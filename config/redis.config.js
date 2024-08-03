const Redis = require('ioredis');

const redis = new Redis({}); // default localhost:6379

redis.on('connect', () => {
  logger.log('Connected to Redis');
});

const setKey = async (key, data, expireTime = 60 * 60) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expireTime);
    return { success: true };
  } catch (error) {
    logger.log(`Error setting key in Redis: ${error}`, 'error');
    return { success: false, msg: error.message };
  }
};

const getKey = async (key) => {
  try {
    const data = await redis.get(key);

    if (!data) {
      return { success: false, msg: 'No data found' };
    }

    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    logger.log(`Error getting key from Redis: ${error}`, 'error');
    return { success: false, msg: error.message };
  }
};

const deleteKey = async (key) => {
  try {
    await redis.del(key);
    return { success: true };
  } catch (error) {
    logger.log(`Error deleting key from Redis: ${error}`, 'error');
    return { success: false, msg: error.message };
  }
};

const deleteKeysByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
    return { success: true };
  } catch (error) {
    logger.log(`Error deleting keys by pattern from Redis: ${error}`, 'error');
    return { success: false, msg: error.message };
  }
};

module.exports = {
  redis,
  setKey,
  getKey,
  deleteKey,
  deleteKeysByPattern,
};
