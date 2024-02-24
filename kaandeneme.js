const WebSocket = require('ws');

const oAuth = "kzwkaaekm1csn0tbv1gcy8mbwfkkbe";
const user = "chatbot674";
const channel = "kaankaraca196";

const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${user}`);
    socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', (event) => {
    console.log(event);
    if (event.data.includes("Hello World")) socket.send(`PRIVMSG #${channel} :cringe`);
    if (event.data.includes("PING")) socket.send("PONG");
    if (event.data.includes("amk")) socket.send(`PRIVMSG #${channel} :/me`);
    if (event.data.includes("PART")) {
        socket.send(`JOIN #${randomChannel}`);
    }
});