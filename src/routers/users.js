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
  updatePassword,
  recoverPassword,
  forgotPassword,
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

router.get("/", getAllUsers);
router.get("/signout", isLoggedIn, userSignOut);
router.get("/profile", isLoggedIn, userProfile);

router.post("/signup", formidable(), userSignUp);
router.post("/verify", userVerify);
router.post("/signin", isLoggedOut, userSignIn);
router.post('/forgot-password', forgotPassword)

router.put("/", isLoggedIn, formidable(), updateUser);
router.put('/update-password', isLoggedIn, updatePassword);
router.put('/recover-password', recoverPassword);

router.delete("/", isLoggedIn, deleteUser);

module.exports = router;
