const sendResponse = (res, statusCode, ok, message = "", data = "") => {
  return res.status(statusCode).json({ ok, message, data });
};

module.exports = sendResponse;
