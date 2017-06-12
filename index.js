var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/** http server */
var files = [{
    name: '/',
    path: '/index.html'
  },
  {
    name: '/game/octaball.js',
    path: '/game/octaball.js'
  },
  {
    name: '/game/game.js',
    path: '/game/game.js'
  },
  {
    name: '/game/ball.js',
    path: '/game/ball.js'
  },
  {
    name: '/game/player.js',
    path: '/game/player.js'
  },
  {
    name: '/game/point.js',
    path: '/game/point.js'
  },
  {
    name: '/game/shoot.js',
    path: '/game/shoot.js'
  }
];

for (var i = 0; i < files.length; i++) {
  app.get(files[i].name, function(path) {
    return function(req, res) {
      res.sendFile(__dirname + path);
    }
  }(files[i].path));
}

http.listen(8080, function() {
  console.log('listening on *:8080');
});

/** end http server */
/** game handling */
var games = {};

function makeRandomGameString(length) {
  do {
    var gameString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      gameString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }
  while (games[gameString] != null)
  return gameString;
}

function createConnects(gameString){
  games[gameString].io = io.of('/'+gameString);
  games[gameString].io.on('connection', function(socket) {
    console.log(gameString + ': someone connected');
    var player = null;
    if (!games[gameString].player0.connected) {
      player = games[gameString].player0;
      player.connected = true;
    } else if (!games[gameString].player1.connected) {
      player = games[gameString].player1;
      player.connected = true;
    } else {
      socket.emit('octaball error', 'game is already full');
    }
    socket.on('disconnect', function() {
      if (player) {
        player.connected = false;
        player.initialized = false;
        console.log(gameString + ':' + player.name + ' disconnected, ending the game');
        games[gameString].io.emit('end game');
      }
      console.log(gameString + ': someone disconnected');
      if(games[gameString].player0.connected == false && games[gameString].player1.connected == false){
        games[gameString] = null;
        console.log(gameString + ': deleting');
      }
    });
    socket.on('initialize', function(ply) {
      if (player) {
        player.name = ply.name;
        player.color = ply.color;
        player.initialized = true;
        console.log(gameString + ':' + player.name + ' initialized with color ' + player.color);
        if (games[gameString].player0.initialized && games[gameString].player1.initialized) {
          console.log(gameString + ': starting the game');
          games[gameString].io.emit('start game', {
            player0: games[gameString].player0,
            player1: games[gameString].player1
          });
        }
      }
    });
    socket.on('try shoot', function(shoot) {
      console.log(gameString + ': ' + shoot.name + ' trying to shoot in ' + shoot.direction);
      games[gameString].io.emit('do shoot', shoot);
    });
  });
}

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on(('new game'),
    function() {
      var gameString = makeRandomGameString(5);
      console.log('Creating new game.. ' + gameString);
      //creating new game
      games[gameString] = {started: false, player0: {connected: false, initialized: false}, player1: {connected: false, initialized: false}};
      createConnects(gameString);
      //telling the user the new game string
      socket.emit('gameString', gameString);
    });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});
