const bcrypt = require("bcrypt");
const saltRounds = 10;

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(`Could not hash the password: ${error.message}`);
  }
};

const comparePassword = async (plainPwd, hashedPwd) => {
  try {
    return await bcrypt.compare(plainPwd, hashedPwd);
  } catch (error) {
    console.log(`Could not hash the password: ${error.message}`);
  }
};

module.exports = { hashPassword, comparePassword };
