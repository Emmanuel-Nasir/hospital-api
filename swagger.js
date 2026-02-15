const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Hospital API",
    version: "1.0.0",
    description: "Hospital API with Patients and Doctors collections (CRUD)"
  }
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"]
};

module.exports = swaggerJSDoc(options);
