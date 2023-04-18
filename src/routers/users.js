const router = require("express").Router();
const session = require("express-session");
const formidable = require("express-formidable");

const {
  userSignUp,
  userVerify,
  userSignIn,
  userSignOut,
  userProfile,
} = require("../controllers/users");
const dev = require("../config");

router.use(
  session({
    name: "user_session",
    secret: dev.sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 10 * 60 },
  })
);

router.post("/signup", formidable(), userSignUp);
router.post("/verify", userVerify);
router.post("/signin", userSignIn);
router.get("/signout", userSignOut);
router.get("/profile", userProfile);

module.exports = router;
