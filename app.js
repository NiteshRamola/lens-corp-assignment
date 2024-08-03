const Logger = require('./utils/winston');
const logger = new Logger();
global.logger = logger;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const package = require('./package.json');
const cookieParser = require('cookie-parser');
const swagger = require('./utils/swagger');
const { createAdminOnServerStart } = require('./controllers/auth-controller');
const http = require('http');
const { initializeSocket } = require('./utils/socket');
const { notFoundErrorResponse } = require('./utils/response');

const app = express();
const server = http.createServer(app);
initializeSocket(server);

require('dotenv').config();

app.use(
  cors({
    origin: 'https://niteshramola.in',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    logger.log('Connected to MongoDB');
    createAdminOnServerStart();
  })
  .catch((err) => logger.log(`Error connecting to MongoDB: ${err}`, 'error'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use(limiter);

swagger(app);

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).send({
    version: package.version,
    success: true,
    msg: 'Server is up and running!',
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Server error' });
});

app.use((req, res, next) => {
  notFoundErrorResponse(res, 'Invalid Endpoint');
});

const exitHandler = require('./utils/exitHandler')(server);

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

module.exports = server;
