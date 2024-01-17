var app = require("../app.js");
var debug = require('debug')('untitled1:server');
var http = require('http');
var socketIo = require('socket.io');
const dataBase = require('../db.handler/db.handler.js');
const User = require('../db.handler/user.model.js');
const Twitch = require('../db.handler/twitch.model.js');
const Record = require('../db.handler/record.model.js');
const twitchApi = require('../twitch.api/twitch.js');

// Connect to DB
let x = async function () {
  await dataBase.connect();

  var port = normalizePort(process.env.PORT || '80');
  app.set('port', port);

  var server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', onError);
  server.on('listening', onListening);

  const io = socketIo(server);

  io.on('connection', (socket) => {
    var user;
    var user_twitch;
    socket.on('twitch.eventsub', async (data) => {
      user = await User.findOne({ trackID: data.alert_id });
      user_twitch =  await Twitch.findOne({ userId: user.userId });
      
      twitchApi.subEvents(
        data.session_id,
        user_twitch.accessToken,
        user_twitch.refreshToken,
        ["channel.cheer", "channel.follow", "channel.subscribe", "channel.subscription.gift", "channel.subscription.message"],
        user_twitch.twitchId
      )
    })

    socket.on('refresh.token', async () => {
      twitchApi.refreshToken(user_twitch.twitchId, user_twitch.refreshToken).then(() => {
        console.log("Refreshed token")
        socket.emit('refresh.page');
      });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected')
      twitchApi.deleteEvents(user_twitch.twitchId, user_twitch.accessToken, user_twitch.refreshToken);
    });

    socket.on('record', (data) => {
      Record.create({
        userId: user.userId,
        record: data
      })
    })
  });

  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    } 

    return false;
  }

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }


}

x();