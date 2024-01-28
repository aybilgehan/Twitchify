const axios = require('axios');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const Users = require("../db.handler/user.model.js");
const Twitch = require("../db.handler/twitch.model.js");
const Counter = require("../db.handler/counter.model.js");
const Record = require("../db.handler/record.model.js");

const webSocket = require('../webSocket/webSocket.js');


const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
TWITCH_SCOPES = [
    "analytics:read:extensions",
    "analytics:read:games",
    "bits:read",
    "channel:manage:ads",
    "channel:read:ads",
    "channel:manage:broadcast",
    "channel:read:charity",
    "channel:edit:commercial",
    "channel:read:editors",
    "channel:manage:extensions",
    "channel:read:goals",
    "channel:read:guest_star",
    "channel:manage:guest_star",
    "channel:read:hype_train",
    "channel:manage:moderators",
    "channel:read:polls",
    "channel:manage:polls",
    "channel:read:predictions",
    "channel:manage:predictions",
    "channel:manage:raids",
    "channel:read:redemptions",
    "channel:manage:redemptions",
    "channel:manage:schedule",
    "channel:read:stream_key",
    "channel:read:subscriptions",
    "channel:manage:videos",
    "channel:read:vips",
    "channel:manage:vips",
    "clips:edit",
    "moderation:read",
    "moderator:manage:announcements",
    "moderator:manage:automod",
    "moderator:read:automod_settings",
    "moderator:manage:automod_settings",
    "moderator:manage:banned_users",
    "moderator:read:blocked_terms",
    "moderator:manage:blocked_terms",
    "moderator:manage:chat_messages",
    "moderator:read:chat_settings",
    "moderator:manage:chat_settings",
    "moderator:read:chatters",
    "moderator:read:followers",
    "moderator:read:guest_star",
    "moderator:manage:guest_star",
    "moderator:read:shield_mode",
    "moderator:manage:shield_mode",
    "moderator:read:shoutouts",
    "moderator:manage:shoutouts",
    "user:edit",
    "user:edit:follows",
    "user:read:blocked_users",
    "user:manage:blocked_users",
    "user:read:broadcast",
    "user:manage:chat_color",
    "user:read:email",
    "user:read:follows",
    "user:read:moderated_channels",
    "user:read:subscriptions",
    "user:manage:whispers",
    "whispers:read",
    "whispers:edit"
]
const encodedScopes = encodeURIComponent(TWITCH_SCOPES.join(' '));

/* --------------------- CONTROLLER FONKSIYONLARI ---------------------*/

async function getNextSequence() {
    if (await Counter.findOne({ name: "userid" }) == null) {
        await Counter.create({ name: "userid", seq: 0 });
    }

    var ret = await Counter.findOneAndUpdate(
        { name: "userid" },
        { $inc: { seq: 1 } },
        { new: true }
    );

    return ret.seq;
}

/* --------------------- WEBSITESI ISLEMLERI ---------------------*/

// Get home page
exports.getMainPage = async (req, res, next) => {
    try {
        res.status(200).render("main", {
            user: req.session.user,
        });
    } catch (error) {
        res.send(error);
    }
}

// Get dashboard page
exports.getDashboardPage = async (req, res, next) => {
    if (req.session.connected) {
        const user = await Users.findOne({ userId: req.session.userId });
        const twitch = await Twitch.findOne({ userId: req.session.userId }); 
        res.render("dashboard", 
        {
            connected: true,
            alertID: user.trackID,
            configs: twitch.configs
        });
    } else {
        res.render("dashboard", {connected: false});
    }
}
    

// Get login page
exports.getLoginPage = async (req, res, next) => {
    try {
        res.status(200).render("login");
    } catch (error) {
        res.send(error);
    }
};

exports.postLoginPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ "username": req.body.username });
        if (!user || user.password != req.body.password) {
            res.render("error", { error: "Invalid username or password", redirect: "/login" })
        } else {
            let twitch = await Twitch.findOne({ userId: user.userId });
            if (twitch == null) {
                req.session.connected = false;
            } else {
                req.session.connected = true;
            }
            req.session.userId = user.userId;
            req.session.user = user.username;
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.getRegisterPage = async (req, res, next) => {
    try {
        res.status(200).render("register");

    } catch (error) {
        console.log(error);
    }
};

exports.postRegisterPage = async (req, res, next) => {
    try {

        let checkEmail = await Users.findOne({ "email": req.body.email })
        let checkUsername = await Users.findOne({ "username": req.body.username })

        if (checkEmail) {
            res.render("error", { error: "Email has already been registered", redirect: "/register" })
        } else if (checkUsername) {
            res.render("error", { error: "Username has already been registered", redirect: "/register" })
        }
        else {
            req.body.userId = await getNextSequence();
            req.body.trackID = uuidv4();
            await Users.create(req.body);
            res.render("success", { success: "Registration successful", redirect: "/login" })
        }
    } catch (error) {
        console.log(error);
    }
};

exports.getLogoutPage = async (req, res, next) => {
    try {
        req.session = null;
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

exports.getAlertPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ trackID: req.params.alertID });
        let twitch = await Twitch.findOne({ userId: user.userId });
        if (twitch != null) {
            res.status(200).render("alert", {configs: twitch.configs}); // Burası config e göre değişecek
        } else {
            res.send("Twitch has not connected!");
        }
    } catch (err) {
        res.send("Invalid track id")
    }
}

/* --------------------- TWITCH ISLEMLERI ---------------------*/

exports.twitchAuth = async (req, res, next) => {
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodedScopes}&client_id=${CLIENT_ID}`;
    res.redirect(twitchAuthUrl);
}

exports.callback = async (req, res, next) => {
    try {
        const code = req.query.code;
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            },
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        // Access token'ı kullanarak Twitch API'ye örnek bir istek yapalım
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const twitch_id = userResponse.data.data[0].id;
        
        if (await Twitch.findOne({ twitchId: twitch_id })) {
            res.render("error", { error: "Twitch has already been connected", redirect: "/dashboard" })
        } else {
            await Twitch.create(
                {
                    userId: req.session.userId,
                    twitchId: twitch_id,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            );
            req.session.connected = true;
        }
        res.redirect("/dashboard");
    } catch (error) {
        res.render("error", { error: "Twitch connection failed", redirect: "/dashboard" });
        console.log(error)
    }
}

exports.regenerateUrl = async (req, res, next) => {
    try {
        let newTrackID = uuidv4();
        await Users.findOneAndUpdate({ userId: req.session.userId }, { trackID: newTrackID }, { new: true });
        webSocket.disconnectUserWhenUrlRefreshed(req.session.userId);
        res.send({ newTrackID: newTrackID, status: "success"})

    } catch (err) {
        res.send({ status: "error" })
    }

}

exports.deleteTwitch = async (req, res, next) => {
    try{
        await Twitch.findOneAndDelete({ userId: req.session.userId });
        req.session.connected = false;
        res.render("success", { success: "Twitch connection deleted", redirect: "/dashboard" });
    } catch (err) {
        res.render("error", { error: "Twitch connection failed", redirect: "/dashboard" });
    }
}

exports.test = async (req, res, next) => {
    webSocket.test(req.session.userId, req.body.testName).then((status) => {
        if (status) {
            res.send("success")
        } else {
            res.send("error")
        }
    })
};

exports.getRecords = async (req, res, next) => {
    try {
        let record = (JSON.parse(JSON.stringify(await Record.find())))
        record.forEach(element => {
            element.record = JSON.parse(element.record)
        })
        console.log(record)
        res.send(record);
    } catch (err) {
        console.log(err);
    }

}