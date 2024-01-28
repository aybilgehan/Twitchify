const express = require("express");
const router = express.Router();
const pageController = require("../page.controller/page.controller.js");
const mw = require("../middlewares/mw.js");

/* - WEBSITE GET ISLEMLERI - */
router.get("/", pageController.getMainPage);
router.get("/dashboard", mw.checkUserLoggedIn, pageController.getDashboardPage);
router.get("/login", mw.checkUserNotLoggedIn, pageController.getLoginPage);
router.get("/register", mw.checkUserNotLoggedIn ,pageController.getRegisterPage);
router.get("/logout", mw.checkUserLoggedIn, pageController.getLogoutPage);

/* - ALERT - */
router.get("/alert/:alertID", pageController.getAlertPage);

/* - TWITCH - */
router.get("/callback", pageController.callback);
router.get("/auth", mw.checkUserLoggedIn, mw.checkTwitchNotConnected , pageController.twitchAuth);
router.get("/refreshUrl", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.refreshUrl);
router.get("/disconnect", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.deleteTwitch);

/* - WEBSITE POST ISLEMLERI - */
router.post("/login", pageController.postLoginPage);
router.post("/register", pageController.postRegisterPage);

router.post("/test",mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.test);

/* - TEST - */
router.get("/test", pageController.getRecords);

module.exports = router;