/* 
  Kullanıcılar her sayfayı (socket açtıklarından) eventlere abone olmak zorundalar.
  Oauth ile abone olduğu için cost olmuyor.
  Her socket açıldığında socket id, user id, event türü ve event id'si birlikte tutulmalı.
  Socket kapatıldığında bu bilgiler silinmeli ve eventsub'dan da silinmeli (event id ile silinir).

  Dipnot: Eventsub için cliend id yani app id kullanılıyor.
  Kullanıcıların bir event e abone olma işlemi backendde yapılmalı.
  Socket açma işlemi frontendde yapılabilir, hiçbir access token gerekmiyor.


 */
const express = require('express');
const axios = require('axios');
const WebSocket = require('ws');
const app = express();
const port = 80;
const socket = require('socket.io');


const io = socket(app.listen(port, () => {
  console.log('listening on *:80');
}));

io.on('connection', (socket) => {
  socket.on('twitch.eventsub', (data) => {
    console.log(data);
    createWebsocketConnection(data, ["channel.cheer", "channel.follow", "channel.subscribe", "channel.subscription.gift", "channel.subscription.message"]);
  });
  socket.on('refresh.token', () => {
    // sockete göre db den refresh token çekilecek
    refreshAccessToken(refreshToken);
    socket.emit('refresh.page');
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
    deleteEventSub(accessToken);
  });
});



app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('/'));
app.set('view engine', 'twig');



app.get('/', (req, res) => {
  res.send('<h1>Twitch OAuth Example</h1><a href="/auth">Authorize with Twitch</a>');
});

app.get('/alert', (req, res) => {
  res.render('alert');
});




