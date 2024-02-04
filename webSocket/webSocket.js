const User = require('../db.handler/user.model.js');
const Twitch = require('../db.handler/twitch.model.js');
const Record = require('../db.handler/record.model.js');
const twitchApi = require('../twitch.api/twitch.js');

const users = {};

exports.eventSub = async function (socket, data) {
    let user = await User.findOne({ trackID: data.alert_id });
    let user_twitch = await Twitch.findOne({ userId: user.userId });

    twitchApi.subEvents(
        data.session_id,
        user_twitch.accessToken,
        user_twitch.refreshToken,
        user_twitch.eventSubs,
        user_twitch.twitchId
    )

    users[user.userId] = { "socket": socket, "user_twitch": user_twitch };
};

exports.refreshToken = async function (socket) {
    let userId = Object.keys(users).find(key => users[key].socket === socket);
    let user_twitch = users[userId].user_twitch;

    twitchApi.refreshToken(user_twitch.twitchId, user_twitch.refreshToken).then(() => {
        console.log("Refreshed token")
        socket.emit('refresh.page');
    });
};

exports.disconnect = async function (socket) {
    let userId = Object.keys(users).find(key => users[key].socket === socket);
    twitchApi.deleteEvents(users[userId].user_twitch.twitchId, users[userId].user_twitch.accessToken, users[userId].user_twitch.refreshToken);
    delete users[userId];
    console.log('user disconnected');
};

exports.record = async function (socket, data) {
    console.log(data)
    let userId = Object.keys(users).find(key => users[key].socket === socket);
    Record.create({
        userId: userId,
        record: data
    })
};

exports.disconnectUserWhenUrlRefreshed = async function (user_id) {
    if (user_id in users){
        users[user_id].socket.disconnect();
    }
};


exports.test = async function (user_id, test_name, config) {
    if (user_id in users) {
        let socket = users[user_id].socket;
        let data;
        switch (test_name) {
            case "follow":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.follow",
                        "version": "2",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337",
                           "moderator_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "followed_at": "2020-07-15T18:16:11.17106713Z"
                    }
                };
                break
            case "newsub":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscribe",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "tier": "1000",
                        "is_gift": false
                    }
                };
                break
            case "substreak":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscription.message",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "tier": "1000",
                        "message": {
                            "text": "Love the stream! FevziGG",
                            "emotes": [
                                {
                                    "begin": 23,
                                    "end": 30,
                                    "id": "302976485"
                                }
                            ]
                        },
                        "cumulative_months": 15,
                        "streak_months": 1, // null if not shared
                        "duration_months": 6
                    }
                };
                break
            case "subgift":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscription.gift",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "total": 2,
                        "tier": "1000",
                        "cumulative_total": 284, //null if anonymous or not shared by the user
                        "is_anonymous": false
                    }
                };
                break
            case "cheer":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.cheer",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                            "broadcaster_user_id": "1337"
                        },
                        "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "is_anonymous": false,
                        "user_id": "1234",          // null if is_anonymous=true
                        "user_login": "cool_user",  // null if is_anonymous=true
                        "user_name": "Cool_User",   // null if is_anonymous=true
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "message": "pogchamp",
                        "bits": 1000
                    }
                };
                break
            case "tier2":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscribe",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "tier": "2000",
                        "is_gift": false
                    }
                };
                break
            case "tier3":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscribe",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": "1234",
                        "user_login": "cool_user",
                        "user_name": "Cool_User",
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "tier": "3000",
                        "is_gift": false
                    }
                };
                break
            case "submysterygift":
                data = {
                    "subscription": {
                        "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
                        "type": "channel.subscription.gift",
                        "version": "1",
                        "status": "enabled",
                        "cost": 0,
                        "condition": {
                           "broadcaster_user_id": "1337"
                        },
                         "transport": {
                            "method": "webhook",
                            "callback": "https://example.com/webhooks/callback"
                        },
                        "created_at": "2019-11-16T10:11:12.634234626Z"
                    },
                    "event": {
                        "user_id": null,
                        "user_login": null,
                        "user_name": null,
                        "broadcaster_user_id": "1337",
                        "broadcaster_user_login": "cooler_user",
                        "broadcaster_user_name": "Cooler_User",
                        "total": 2,
                        "tier": "1000",
                        "cumulative_total": null, //null if anonymous or not shared by the user
                        "is_anonymous": true
                    }
                };

        };
        data.config = config;
        socket.emit('test', data);
        return true;
    } else {
        return false;
    }
}
