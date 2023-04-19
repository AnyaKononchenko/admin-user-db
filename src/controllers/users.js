const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/users");
const sendEmail = require("../helpers/mailer");
const dev = require("../config");

const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const sendResponse = require("../helpers/responseHandler");
const { isPasswordValid } = require("../helpers/requestBodyValidator");

const userSignUp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const image = req.file && req.file.filename;

    if (!name || !email || !phone || !password)
      sendResponse(
        res,
        400,
        false,
        "Bad Request: some of the fields are missing"
      );

    isPasswordValid(res, password);

    const isExist = await User.findOne({ email });
    if (isExist)
      sendResponse(
        res,
        400,
        false,
        "Bad Request:  user with this email already exists"
      );

    const hashedPassword = await hashPassword(password);

    const token = jwt.sign(
      { name, email, phone, hashedPassword, image },
      dev.tokenKey,
      { expiresIn: "5m" }
    );

    const emailContent = {
      email,
      subject: "Your Account Verification",
      html: `
        <h2> Hey ${name} </h2>
        <p>To activate your account, please click <a href='${dev.clientUrl}/user/verify?token=${token}' target="_blank">here</a></p>
      `,
    };

    // sendEmail(emailContent);

    sendResponse(
      res,
      200,
      true,
      "User is registered and needs to be verified",
      token
    );
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const userVerify = (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      sendResponse(res, 400, false, "Bad Request: a token is missing");

    jwt.verify(token, dev.tokenKey, async (error, decoded) => {
      if (error) {
        sendResponse(res, 400, false, "Bad Request: a token is expired");
      }

      const { name, email, phone, hashedPassword, image } = decoded;

      const isExist = await User.findOne({ email });
      if (isExist)
        sendResponse(
          res,
          400,
          false,
          "Bad Request: user with this email already exists"
        );

      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      if (image) newUser = { ...userImage, image };

      const savedUser = await newUser.save();
      if (!savedUser)
        sendResponse(res, 400, false, "Bad Request: could not save a new user");

      sendResponse(res, 200, true, "User is verified");
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const userSignIn = async (req, res) => {
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
        "Bad Request: user with this email does not exist. Sign up first"
      );

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch)
      sendResponse(res, 400, false, "Bad Request: invalid email or password");

    if (user.is_banned)
      sendResponse(
        res,
        403,
        false,
        "Bad Request: this user is banned at the moment"
      );

    req.session.userId = user._id;

    sendResponse(res, 200, true, `Welcome, ${user.name}!`);
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const userSignOut = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");

    sendResponse(res, 200, true, "Signing out is successfull");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user)
      sendResponse(res, 400, false, "Bad Request: this user does not exist");

    sendResponse(
      res,
      200,
      true,
      `OK: ${user.name}'s profile is available`,
      user
    );
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const deleteUser = async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.session.userId);
    if (!deleteUser)
      sendResponse(res, 400, false, "Bad Request: could not delete this user");

    sendResponse(res, 200, true, "OK: user was deleted");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const updateUser = async (req, res) => {
  try {
    const { image } = req.files;

    const updateUser = await User.findOneAndUpdate(
      { _id: req.session.userId },
      { ...req.fields },
      { new: true }
    );

    if (image) {
      updateUser.image.data = fs.readFileSync(image.path);
      updateUser.image.contentType = image.type;
      await updateUser.save();
    }

    if (!updateUser)
      sendResponse(res, 400, false, "Bad Request: could not update this user");

    sendResponse(res, 200, true, "OK: user was updated", updateUser);
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.session.userId);

    const isPasswordMatch = await comparePassword(oldPassword, user.password);
    if (!isPasswordMatch)
      sendResponse(res, 401, false, "Wrong password was entered!");

    user.password = await hashPassword(newPassword);

    const updatedUser = await user.save();
    if (!updatedUser)
      sendResponse(res, 400, false, "Bad Request: could not save the changes");

    sendResponse(res, 200, true, "OK: password was updated");
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      sendResponse(res, 400, false, "Bad Request: this user does not exist");

    const token = jwt.sign({ id: user._id }, dev.tokenKey, { expiresIn: "5m" });

    const emailContent = {
      email,
      subject: "Password Recovery",
      html: `
        <h2> Hey ${user.name} </h2>
        <h4>Password recovery was requested!</h4>
        <p>To recover your password, please click <a href='${dev.clientUrl}/user/recover-password?token=${token}' target="_blank">here</a></p>
        <p>If you did not request password recovery, then please ignore this email.</p>
        `,
    };

    sendEmail(emailContent);

    sendResponse(
      res,
      200,
      true,
      "Password recovery link was sent to your email",
      token
    );
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

const recoverPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    isPasswordValid(res, password);

    jwt.verify(token, dev.tokenKey, async (error, decoded) => {
      if (error) {
        sendResponse(res, 400, false, "Bad Request: a token is expired");
      }
      const { id } = decoded;
      const hashedPassword = await hashPassword(password);

      const user = await User.findByIdAndUpdate(id, {
        password: hashedPassword,
      });

      if (!user)
        sendResponse(
          res,
          400,
          false,
          "Bad Request: could not set a new password"
        );

      sendResponse(res, 200, true, "Password is recovered");
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

module.exports = {
  userSignUp,
  userVerify,
  userSignIn,
  userSignOut,
  userProfile,
  deleteUser,
  updateUser,
  updatePassword,
  forgotPassword,
  recoverPassword,
};
