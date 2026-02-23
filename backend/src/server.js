const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const pool = require("./config/database");
const Response = require("./models/Response");
const AdministrativeArea = require("./models/AdministrativeArea");
const responseRoutes = require("./routes/responseRoutes");
const locationRoutes = require("./routes/locationRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server is unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/responses", responseRoutes);
app.use("/api/locations", locationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ICPAC Drought Impact Tracker API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      responses: "/api/responses",
      locations: "/api/locations",
      locationsCountries: "/api/locations/countries",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("Database connection established");

    // Create tables if they don't exist
    await Response.createTable();
    await AdministrativeArea.createTable();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API available at http://localhost:${PORT}/api/responses`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});
