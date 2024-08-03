const server = require('./app');

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.log(`Server is listening on port ${PORT}`);
});
