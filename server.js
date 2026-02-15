require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const { connectDB } = require("./db/connect");
const swaggerSpec = require("./swagger");

const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");

const app = express();

app.use(cors());
app.use(express.json());

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hospital API is running" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
