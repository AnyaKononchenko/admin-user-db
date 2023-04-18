const router = require('express').Router();
const session = require("express-session");
const dev = require('../config');
const { adminSignIn, adminSignOut, getAllUsers } = require('../controllers/admin');
const { isLoggedOut, isLoggedIn } = require('../middlewares/auth');

router.use(
  session({
    name: "admin_session",
    secret: dev.sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 6000 },
  })
);

router.post("/signin", isLoggedOut, adminSignIn);
router.get("/signout", isLoggedIn, adminSignOut);
router.get("/all-users", isLoggedIn, getAllUsers);

module.exports = router;
