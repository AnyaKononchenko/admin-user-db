const router = require("express").Router();
const session = require("express-session");
const formidable = require("express-formidable");

const {
  userSignUp,
  userVerify,
  userSignIn,
  userSignOut,
  userProfile,
  deleteUser,
  updateUser,
  getAllUsers,
} = require("../controllers/users");
const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

router.use(
  session({
    name: "user_session",
    secret: dev.sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 100 * 6000 },
  })
);

router.post("/signup", formidable(), userSignUp);
router.post("/verify", userVerify);
router.post("/signin", isLoggedOut, userSignIn);
router.get("/signout", isLoggedIn, userSignOut);
router.get("/profile", isLoggedIn, userProfile);
router.delete("/", isLoggedIn, deleteUser);
router.put("/", isLoggedIn, formidable(), updateUser);
router.get("/", getAllUsers);

module.exports = router;
