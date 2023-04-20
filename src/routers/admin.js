const router = require('express').Router();
const session = require("express-session");
const dev = require('../config');
const { adminSignIn, adminSignOut, getAllUsers, adminDeleteAllUsers, adminDeleteUser, adminUpdateUser } = require('../controllers/admin');
const { isLoggedOut, isLoggedIn, isAdmin } = require('../middlewares/auth');

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
router.get("/all-users", isAdmin, getAllUsers);
router.delete('/', isAdmin, adminDeleteUser);
router.put('/', isAdmin, adminUpdateUser);

module.exports = router;
