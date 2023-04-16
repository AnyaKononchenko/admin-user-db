const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/users");
const hashPassword = require("../helpers/hashPassword");
const dev = require("../config");
const sendEmail = require("../helpers/mailer");

const userSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.fields;
    const { image } = req.files;

    if (!name || !email || !phone || !password)
      return res
        .status(400)
        .json({ message: "Bad Request: some of the fields are missing" });

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
    console.log('password:', password);
    console.log('hashed:', hashedPassword);

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
        <p>To activate your account, please click <a href='${dev.clientUrl}/user/verify/${token}' target="_blank">here</a></p>
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
      console.log('decoded', decoded);

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

module.exports = { userSignup, userVerify };
