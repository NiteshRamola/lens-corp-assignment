const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));

function setupSwagger(app) {
  app.use(
    '/api-docs',
    (req, res, next) => {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );
}

module.exports = setupSwagger;
