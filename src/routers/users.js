const router = require("express").Router();
const session = require("express-session");
const upload = require('../middlewares/uploadImage');

const {
  userSignUp,
  userVerify,
  userSignIn,
  userSignOut,
  userProfile,
  deleteUser,
  updateUser,
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

router.get("/signout", isLoggedIn, userSignOut);
router.get("/profile", isLoggedIn, userProfile);

router.post("/signup", upload.single('image'), userSignUp);
router.post("/verify", userVerify);
router.post("/signin", isLoggedOut, userSignIn);
router.post("/forgot-password", isLoggedOut, forgotPassword);

router.put("/", isLoggedIn, upload.single('image'), updateUser);
router.put("/update-password", isLoggedIn, updatePassword);
router.put("/recover-password", isLoggedOut, recoverPassword);

router.delete("/", isLoggedIn, deleteUser);

module.exports = router;
