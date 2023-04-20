const User = require("../models/users");
const dev = require("../config");

const { comparePassword } = require("../helpers/bcrypt");
const sendResponse = require("../helpers/responseHandler");
const { isPasswordValid } = require("../helpers/requestBodyValidator");

const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      sendResponse(
        res,
        400,
        false,
        "Bad Request: some of the fields are missing"
      );

    isPasswordValid(res, password);

    const user = await User.findOne({ email });
    if (!user)
      sendResponse(
        res,
        400,
        false,
        "Bad Request: user with this email does not exist. Sign up first."
      );

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) 
      sendResponse(res, 400, false, "Bad Request: invalid email or password");

    if (user.is_admin === 0)
      sendResponse(res, 403, false, "Forbidden: access rejected");

    req.session.userId = user._id;

    sendResponse(res, 200, true, `Welcome, admin ${user.name}!`);
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const adminSignOut = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");

    sendResponse(res, 200, true, "Admin session is ended");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 });
    if (!users)
      sendResponse(res, 400, false, "Bad Request: could not get all users");

    sendResponse(res, 200, true, "Returned all users", users);
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser)
      sendResponse(res, 400, false, "Could not delete this user");

    sendResponse(res, 200, true, "User is deleted");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const foundUser = await User.findById(id);
    if (!foundUser)
      sendResponse(
        res,
        400,
        false,
        "Bad Request: user with this ID is not found"
      );

    sendResponse(res, 200, true, "User is updated");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const adminDeleteAllUsers = async (req, res) => {
  try {
    sendResponse(res, 200, true, "All users were deleted");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

module.exports = {
  adminSignIn,
  adminSignOut,
  getAllUsers,
  adminDeleteUser,
  adminUpdateUser,
};
