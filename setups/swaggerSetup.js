const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '📘 API Documentation',
      version: '1.0.0',
      description: '📄 Tài liệu API cho ứng dụng Node.js với Express',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '🌐 Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Định nghĩa nơi Swagger tìm kiếm các comment
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;