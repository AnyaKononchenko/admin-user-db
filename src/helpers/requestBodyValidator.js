const sendResponse = require("./responseHandler");

const isPasswordValid = (res, password) => {
  if (!password || password.length < 8)
    sendResponse(res, 400, false, "Bad Request: password length is not valid");
};

module.exports = { isPasswordValid };
