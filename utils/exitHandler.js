const exitHandler = (server, options = { coredump: false, timeout: 500 }) => {
  const exit = (code) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => (err, promise) => {
    if (err && err instanceof Error) {
      logger.log(`${err.message}`, 'error');
    }

    // Attempt a graceful shutdown
    logger.log(
      `Server shutting down with exit code: ${code}, reason: ${reason}`,
    );
    server.close(() => {
      exit(code);
    });
    setTimeout(exit, options.timeout).unref();
  };
};

module.exports = exitHandler;
