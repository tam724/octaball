var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game/game');
var Player = require('./game/player');


/** http server */
var files = [{
    name: '/',
    path: '/index.html'
  },
  {
    name: '/style.css',
    path: '/style.css'
  },
  {
    name: '/octaball.js',
    path: '/octaball.js'
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
var emits = {
  octaballError: 'octaball error',
  endGame: 'end game',
  startGame: 'start game',
  gameUpdate: 'gameUpdate',
  shootResult: 'shootResult'
};

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

function createNewGame() {
  var gameString = makeRandomGameString(5);
  console.log('Creating new game.. ' + gameString);
  games[gameString] = {
    player0: new Player(),
    player1: new Player(),
    game: null
  };
  games[gameString].io = io.of('/' + gameString);
  games[gameString].io.on('connection', function(socket) {
    //a new player wants to connect and initialize
    var player = null;
    if (!games[gameString].player0.connected) {
      //if there is no player0 connected, connect this player to player0
      player = games[gameString].player0;
      player.connected = true;
    } else if (!games[gameString].player1.connected) {
      //if there is no player1 connected, connect this player to player1
      player = games[gameString].player1;
      player.connected = true;
    } else {
      //else there are already two player in this game
      socket.emit(emits.octaballError, 'game is already full');
    }

    socket.on('disconnect', function() {
      if (player) {
        console.log(gameString + ':' + player.name + ' disconnected, ending the game');
        games[gameString].io.emit(emits.endGame);
        player.connected = false;
      }
      if (games[gameString].player0.connected == false && games[gameString].player1.connected == false) {
        console.log(gameString + ': deleting');
        delete games[gameString];
        delete io.nsps['/' + gameString];
      }
    });

    socket.on('initialize', function(ply) {
      if (player) {
        player.initialize(ply.name, ply.color);
        console.log(gameString + ':' + player.name + ' initialized with color ' + player.color);

        if (games[gameString].player0.initialized && games[gameString].player1.initialized) {
          //if there are two initialized players, start the game
          console.log(gameString + ': starting the game');
          games[gameString].game = new Game(games[gameString].player0, games[gameString].player1);
          games[gameString].io.emit(emits.startGame, {
            player0: games[gameString].player0,
            player1: games[gameString].player1
          });
          games[gameString].io.emit(emits.gameUpdate, games[gameString].game.getForSending());
        }
      }
    });

    socket.on('shoot', function(direction) {
      console.log(gameString + ': ' + player.name + ' trying to shoot in ' + direction);
      if (games[gameString].game) {
        var shootResult = games[gameString].game.tryShoot(direction, player);
        if (shootResult == 'OK') {
          //alright shoot done
          games[gameString].io.emit(emits.gameUpdate, games[gameString].game.getForSending());
        } else {
          //shoot not allowed
          socket.emit(emits.shootResult, shootResult);
        }
      }
    });
  });
  return gameString;
}

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on(('new game'),
    function() {
      var gameString = createNewGame();
      //telling the user the new game string
      socket.emit('gameString', gameString);
    });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});
