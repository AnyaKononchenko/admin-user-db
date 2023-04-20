const sendResponse = require("../helpers/responseHandler");
const User = require("../models/users");

const isLoggedIn = (req, res, next) => {
  try {
    if (!req.session.userId) sendResponse(res, 400, false, "Sign In First")
    next();
  } catch (error) {
    console.log(error);
  }
};

const isLoggedOut = (req, res, next) => {
  try {
    if (req.session.userId)
      sendResponse(res, 400, false, "Already signed in")
    next();
  } catch (error) {
    console.log(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.session.userId){
      const user = await User.findById(req.session.userId);
      console.log(user);
      if(user && user.is_admin === 0)
        sendResponse(res, 403, false, "Forbidden: access rejected")
      next();
    } else {
      sendResponse(res, 400, false, "Sign In First")
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { isLoggedIn, isLoggedOut, isAdmin };
