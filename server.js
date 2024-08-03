const server = require('./app');

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  logger.log(`Server is listening on port ${PORT}`);
});
