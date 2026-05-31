const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const setupSwagger = (app) => {
  const options = {
    customSiteTitle: 'SNEAKERLAB API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
    ]
  };

  // Mount Swagger UI tại đường dẫn /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  
  console.log('Swagger UI đã được thiết lập thành công tại /api-docs');
};

module.exports = { setupSwagger };
