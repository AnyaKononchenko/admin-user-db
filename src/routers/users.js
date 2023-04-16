const router = require("express").Router();
const formidable = require("express-formidable");

const { userSignup } = require("../controllers/users");

router.post("/signup", formidable(), userSignup);

module.exports = router;
