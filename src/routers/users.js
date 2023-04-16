const router = require("express").Router();
const formidable = require("express-formidable");

const { userSignup, userVerify } = require("../controllers/users");

router.post("/signup", formidable(), userSignup);
router.post("/verify", userVerify)

module.exports = router;
