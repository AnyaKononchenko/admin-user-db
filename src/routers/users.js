const router = require("express").Router();
const formidable = require("express-formidable");

const { userSignUp, userVerify, userSignIn, userSignOut } = require("../controllers/users");

router.post("/signup", formidable(), userSignUp);
router.post("/verify", userVerify)
router.post("/signin", userSignIn)
router.get("/signout", userSignOut)

module.exports = router;
