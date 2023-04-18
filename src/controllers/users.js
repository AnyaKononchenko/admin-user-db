const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/users");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const dev = require("../config");
const sendEmail = require("../helpers/mailer");

const userSignUp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.fields;
    const { image } = req.files;

    if (!name || !email || !phone || !password)
      return res
        .status(400)
        .json({ message: "Bad Request: some of the fields are missing" });

    if (password.length < 8 || phone.length < 10)
      return res.status(400).json({
        message: "Bad Request: password or phone length is not valid",
      });

    if (image && image.size > 2000000)
      return res.status(413).json({
        message: "Payload Too Large: image size should be less than 2MB",
      });

    const isExist = await User.findOne({ email });
    if (isExist)
      return res
        .status(400)
        .json({ message: "Bad Request: user with this email already exists" });

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

    sendEmail(emailContent);

    res
      .status(200)
      .json({ message: "User is registered and needs to be verified", token });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const userVerify = (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ message: "Bad Request: a token is missing" });

    jwt.verify(token, dev.tokenKey, async (error, decoded) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "Bad Request: a token is expired" });
      }

      const { name, email, phone, hashedPassword, image } = decoded;

      const isExist = await User.findOne({ email });
      if (isExist)
        return res.status(400).json({
          message: "Bad Request: user with this email already exists",
        });

      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
      }

      const savedUser = await newUser.save();
      if (!savedUser)
        return res
          .status(400)
          .json({ message: "Bad Request: something went wrong" });

      res.status(200).json({ message: "User is verified" });
    });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const userSignIn = async (req, res) => {
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

    req.session.userId = user._id;

    res.status(200).json({ message: `Welcome, ${user.name}!` });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const userSignOut = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");

    res.status(200).json({ message: "Signing out is successfull" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const userProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    if (!user)
      return res
        .status(400)
        .json({ message: "Bad Request: this user does not exist" });
    res
      .status(200)
      .json({ message: `OK: ${user.name}'s profile is available`, user });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser)
      return res
        .status(400)
        .json({ message: "Bad Request: could not delete this user" });
    res.status(200).json({ message: "OK: user was deleted" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { id } = req.query;
    console.log(name)
    console.log(id)

    const user = await User.findById(id);
    console.log(user);

    const updateUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          phone,
        },
      },
      { new: true }
    );

    console.log(updateUser);

    if (!updateUser)
      return res
        .status(400)
        .json({ message: "Bad Request: could not update this user" });

    res.status(200).json({ message: "OK: user was updated", user: updateUser });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users)
      return res
        .status(400)
        .json({ message: "Bad Request: could not get all users" });
    res.status(200).json({ message: "OK", users });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
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
  getAllUsers,
};
