require("dotenv").config();

const dev = {
  serverPort: process.env.PORT,
  databaseUrl: process.env.MONGODB_ULR,
  tokenKey: process.env.TOKEN_PR_KEY,
  sessionKey: process.env.SESSION_PR_KEY,
  mailer: {
    sender: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  },
  clientUrl: process.env.CLIENT_URL,
};

module.exports = dev;