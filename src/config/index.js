require("dotenv").config();

const dev = {
  serverPort: process.env.PORT,
  databaseUrl: process.env.MONGODB_ULR,
};

module.exports = dev;