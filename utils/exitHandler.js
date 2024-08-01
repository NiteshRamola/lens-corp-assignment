module.exports = (server, options = { coredump: false, timeout: 500 }) => {
  // Exit function
  const exit = (code) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => (err, promise) => {
    if (err && err instanceof Error) {
      logger.log(`${err.message}`, 'error');
    }

    // Attempt a graceful shutdown
    logger.log(`Server shutting down with exit code: ${server}`);
    server.close(exit);
    setTimeout(exit, options.timeout).unref();
  };
};
