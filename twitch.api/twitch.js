const Twitch = require("../db.handler/twitch.model.js");
const axios = require('axios');
const fetch = require("node-fetch");

const redirectUri = process.env.REDIRECT_URI;
const clientID = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;


// Sub to events

exports.subEvents = async function (session_id, access_token, refresh_token, types, twitch_id) {
    const eventSubTypes = {
        "channel.follow": 2,
        "channel.subscribe": 1,
        "channel.subscription.gift": 1,
        "channel.subscription.message": 1,
        "channel.cheer": 1,
        "channel.chat.message": 1
    }
    try {

        await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: {
                'Authorization': `OAuth ${access_token}`
            },
        }).then(res => res.json()).then(async json => {
            if (json.status == 401) {
                await refreshToken(twitch_id, refresh_token).then((new_access_token) => {
                    console.log("new access token: " + new_access_token);
                    access_token = new_access_token;
                });
            }
        }).then(() => {
            if (types.length > 0) {
                types.push("channel.chat.message")
                console.log(types)
                types.forEach(async element => {
                    await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
                        method: 'POST',
                        headers: {
                            'Client-ID': clientID,
                            'Authorization': `Bearer ${access_token}`, // accessToken'ı Twitch OAuth ile almanız gerekiyor
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: element, // İzlenmesi istenen olay türü (örneğin, 'channel.subscribe', 'channel.cheer' gibi)
                            version: `${eventSubTypes[element]}`,
                            condition: {
                                broadcaster_user_id: `${twitch_id}`, // Kanalın kullanıcı kimliği (Channel ID)
                                moderator_user_id: `${twitch_id}`, // Kanalın kullanıcı kimliği (Channel ID)
                                user_id: `${twitch_id}` // Kanalın kullanıcı kimliği (Channel ID)
                            },
                            transport: {
                                method: 'websocket',
                                session_id: session_id
                            },
                        }),
                    }).then(res => res.json()).then(json => {
                        console.log(json);
                    });
                });
            } else { return false }
        })

    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.deleteEvents = async function (twitch_id, access_token, refresh_token) {
    try {
        await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: {
                'Authorization': `OAuth ${access_token}`
            },
        }).then(res => res.json()).then(async json => {
            if (json.status == 401) {
                await refreshToken(twitch_id, refresh_token).then((new_access_token) => {
                    access_token = new_access_token;
                });
            }
        }).then(async () => {
            await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
                method: 'GET',
                headers: {
                    'Client-ID': clientID,
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(res => res.json()).then(events => {
                // Sonra hepsini siliyoruz
                console.log(events["data"])
                events["data"].forEach(async element => {
                    await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${element.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Client-ID': clientID,
                            'Authorization': `Bearer ${access_token}`
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
}


const refreshToken = async function (twitch_id, refresh_token) {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        },
    });
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    await Twitch.findOneAndUpdate({ twitchId: twitch_id }, { accessToken: accessToken, refreshToken: refreshToken }, { new: true });

    return accessToken;
}

exports.refreshToken = refreshToken;