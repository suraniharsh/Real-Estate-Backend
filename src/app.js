const express = require("express");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const builderRoutes = require("./routes/builderRoutes");
const propertyRoutes = require("./routes/propertyRoutes")

const errorHandler = require("./middleware/errorHandler");

const { logRequest } = require("./utils/logger");

const app = express();

app.use(express.json());
app.use(logRequest); // Add request logging middleware

// Routes
app.use("/v1/health", healthRoutes);
app.use('/v1/auth', authRoutes);
app.use("/v1/customers", customerRoutes);
app.use("/v1/agents", agentRoutes);
app.use("/v1/builders", builderRoutes);
app.use("/v1/properties", propertyRoutes);

app.get("/", (req, res) => res.send("Real Estate Platform API"));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
