var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./website/game/game');
var Player = require('./website/game/player');
var MsgClass = require('./website/messages.js');
var Messages = new MsgClass();

/** http server */
app.use('/', express.static('website'));

http.listen(8080, function() {
  console.log('listening on *:8080');
});
/** end http server */

/** game creation
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

function startNewGame(gameString) {
  games[gameString].game = new Game(games[gameString].player0, games[gameString].player1);
  games[gameString].io.emit(Messages.gameUpdate.rsp, games[gameString].game.getForSending());
  games[gameString].io.emit(Messages.gameInterrupt.rsp, {
    msg: Messages.gameInterrupt.rst.gameStart
  });
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

    if (games[gameString].player0.connected && games[gameString].player1.connected) {
      games[gameString].io.emit(Messages.roomConnected.rsp);
    }

    socket.on('disconnect', function() {
      if (player && games[gameString]) {
        console.log(gameString + ':' + player.name + ' disconnected, ending the game');
        games[gameString].io.emit(Messages.gameInterrupt.rsp, {
          msg: Messages.gameInterrupt.rst.gameEnd,
          data: 'disconnect'
        });
        player.connected = false;
      }
      if (games[gameString] && (games[gameString].player0.connected == false || games[gameString].player1.connected == false)) {
        console.log(gameString + ': deleting');
        delete games[gameString];
        delete io.nsps['/' + gameString];
      }
    });

    socket.on(Messages.initialize.msg, function(ply) {
      if (player && games[gameString]) {
        player.initialize(ply.name, ply.color);
        console.log(gameString + ':' + player.name + ' initialized with color ' + player.color);
        socket.emit(Messages.initialize.rsp);

        if (games[gameString].player0.initialized && games[gameString].player1.initialized) {
          //if there are two initialized players, start the game
          console.log(gameString + ': starting the game');
          startNewGame(gameString);
        }
      }
    });

    socket.on(Messages.shoot.msg, function(direction) {
      console.log(gameString + ': ' + player.name + ' trying to shoot in ' + direction);
      if (games[gameString] && games[gameString].game) {
        var shootResult = games[gameString].game.tryShoot(direction, player);
        if (shootResult.msg == 'OK') {
          //alright shoot done
          socket.emit(Messages.shoot.rsp, Messages.shoot.rst.ok);
          games[gameString].io.emit(Messages.gameUpdate.rsp, games[gameString].game.getForSending());
          if (games[gameString].game.winner != null) {
            games[gameString].io.emit(Messages.gameInterrupt.rsp, {
              msg: Messages.gameInterrupt.rst.gameEnd,
              data: 'winner',
              player: games[gameString].game.winner
            });
          }
        } else if (shootResult.msg == 'GameWon') {
          socket.emit(Messages.shoot.rsp, Messages.shoot.rst.gameWon);
        } else if (shootResult.msg == 'NotYourTurn') {
          socket.emit(Messages.shoot.rsp, Messages.shoot.rst.notYourTurn);
        } else if (shootResult.msg == 'ShootOccupied') {
          socket.emit(Messages.shoot.rsp, Messages.shoot.rst.occupied);
        } else if (shootResult.msg == 'Border') {
          socket.emit(Messages.shoot.rsp, Messages.shoot.rst.border);
        } else {
          console.log('strange shoot Result: ' + shootResult);
          socket.emit(Messages.shoot.rsp, shootResult);
        }
      }
    });

    socket.on(Messages.gameInfo.msg, function(info) {
      if (games[gameString] && games[gameString].game) {
        if (info == Messages.gameInfo.rst.again) {
          if (games[gameString].game.winner) {
            player.again = true;
            socket.broadcast.emit(Messages.gameInfo.rsp, {
              msg: Messages.gameInfo.rst.again,
              player: player.name
            });
            if (games[gameString].game.player0.again && games[gameString].game.player1.again) {
              games[gameString].player0.again = false;
              games[gameString].player1.again = false;
              startNewGame(gameString);
            }
          }
        }
      }
    });
  });
  setInterval(deleteGame, 300000, gameString);
  return gameString;
}

function deleteGame(gameString){
  if(games[gameString]){
    if(!(games[gameString].player0.initialized || games[gameString].player1.initialized)){
      console.log(gameString + ': deleting');
      delete games[gameString];
      delete io.nsps['/' + gameString];
    }
  }
}


io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on(Messages.createID.msg, function() {
    var gameID = createNewGame();
    //telling the user the new game string
    socket.emit(Messages.createID.rsp, gameID);
  });
  socket.on(Messages.checkID.msg, function(gameID) {
    if (!games[gameID]) {
      socket.emit(Messages.checkID.rsp, Messages.checkID.rst.error);
    } else {
      socket.emit(Messages.checkID.rsp, Messages.checkID.rst.ok);
    }
  })
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});
