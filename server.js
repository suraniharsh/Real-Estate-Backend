const app = require("./src/app");
const { connectDB } = require("./src/config/database");
const { logger } = require("./src/utils/logger");

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database", { error: err.message });
  });
