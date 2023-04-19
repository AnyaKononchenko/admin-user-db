const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/users");
const sendEmail = require("../helpers/mailer");
const dev = require("../config");

const { comparePassword } = require("../helpers/bcrypt");

const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Bad Request: some of the fields are missing" });

    if (password.length < 8)
      return res.status(400).json({
        message: "Bad Request: password length is not valid",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message:
          "Bad Request: user with this email does not exist. Sign up first",
      });

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch)
      return res
        .status(400)
        .json({ message: "Bad Request: invalid email or password" });

    if (user.is_admin === 0)
      return res
        .status(403)
        .json({ message: "Forbidden: access rejected" });

    req.session.userId = user._id;

    res.status(200).json({ message: `Welcome, admin ${user.name}!` });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const adminSignOut = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");

    res.status(200).json({ message: "Admin session is ended" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({is_admin: 0});
    if (!users)
      return res
        .status(400)
        .json({ message: "Bad Request: could not get all users" });
    res.status(200).json({ message: "OK", users });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    

    res.status(200).json({ message: "User is deleted" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    

    res.status(200).json({ message: "User is updated" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const adminDeleteAllUsers = async (req, res) => {
  try {
    

    res.status(200).json({ message: "User is updated" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = { adminSignIn, adminSignOut, getAllUsers };
