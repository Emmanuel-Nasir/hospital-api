require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const { connectDB } = require("./db/connect");
const swaggerSpec = require("./swagger");

const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");
const departmentRoutes = require("./routes/departments");
const appointmentRoutes = require("./routes/appointments");
const session = require("express-session");
const passport = require("passport");
require("./auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Authentication Routes
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/"); // Redirect to home or dashboard after successful login
});
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/"); // Redirect to home after logout
  });
});
// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/departments", departmentRoutes);
app.use("/appointments", appointmentRoutes);

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
  if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
});
module.exports = app; // Export app for testing
