const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pageController = require("../page.controller/page.controller.js");
const mw = require("../middlewares/mw.js");

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1024 * 1024 * 1},
    fileFilter: (req, file, cb) => {
        // Yalnızca belirli dosya türlerine izin ver
        const allowedFileTypes = ['.png', '.jpeg', '.jpg', '.webp', '.gif'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(extname)) {
            return cb(null, true);
        } else {
            return cb(new Error('Yalnızca PNG, JPEG, JPG, WebP ve GIF dosyalarına izin verilir.'));
        }
    }
});

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
router.get("/disconnect", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.deleteTwitch);

/* - TWITCH POST ISLEMLERI - */
router.post("/regenerate", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.regenerateUrl);
router.post("/test", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.test);


/* - WEBSITE POST ISLEMLERI - */
router.post("/login", pageController.postLoginPage);
router.post("/register", pageController.postRegisterPage);
router.post("/update-config", mw.checkUserLoggedIn, mw.checkTwitchConnected, pageController.postUpdateConfigs);
router.post("/upload", mw.checkUserLoggedIn, mw.checkTwitchConnected, upload.single('file') ,pageController.uploadImage);


/* - TEST - */
router.get("/get-records", pageController.getRecords);

module.exports = router;