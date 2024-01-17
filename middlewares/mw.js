exports.checkUserLoggedIn = async(req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
}

exports.checkUserNotLoggedIn = async(req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        next();
    }
}

exports.checkTwitchConnected = async(req, res, next) => {
    if (req.session.connected) {
        next();
    } else {
        res.redirect("/");
    }
}

exports.checkTwitchNotConnected = async(req, res, next) => {
    if (req.session.connected) {
        res.redirect("/");
    } else {
        next();
    }
}