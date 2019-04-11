let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let Octaball = require('./game/octaball');
let MsgClass = require('./website/messages.js');
let Messages = new MsgClass();

/** http server */
app.use('/', express.static('./'));

http.listen(8080, function() {
  console.log('listening on *:8080');
});
/** end http server */

/** game creation
/** game handling */
let games = {};

const ROLE_SPECTATOR = 0
const ROLE_PLAYER = 1

class Member {
  constructor(socket, session) {
    this.role = ROLE_SPECTATOR;
    this.socket = socket;
    this.session = session;
    this.player = null
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('initialize', (data) => this.initialize(data.role, data.name, data.color));
    this.socket.on(Messages.shoot.msg, (dir) => this.tryShoot(dir));
    this.socket.on(Messages.gameInfo.msg, (info) => this.gameInfo(info));
  }

  gameInfo(info) {
    // if (this.game) {
    //   if (info == Messages.gameInfo.rst.again) {
    //     this.log('again')
    //     if (this.game.getWinner()) {
    //       player.again = true;
    //       socket.broadcast.emit(Messages.gameInfo.rsp, {
    //         msg: Messages.gameInfo.rst.again,
    //         player: player.name
    //       });
    //       if (this.game.player0.again && this.game.player1.again) {
    //         this.player0.again = false;
    //         this.player1.again = false;
    //         startNewGame(this.gameString);
    //       }
    //     }
    //   }
    // }
  }

  setRole(role) {
    if (role == ROLE_PLAYER && this.role == ROLE_SPECTATOR) {
      if (this.session.hasTwoPlayers()) {
        this.session.log("role not allowed, session already has two players")
        this.role = ROLE_SPECTATOR;
      } else {
        this.role = role;
      }
    } else {
      this.role = role;
    }
    if (this.role == ROLE_SPECTATOR) {
      this.socket.emit(Messages.gameInterrupt.rsp, {
        msg: Messages.gameInterrupt.rst.gameStart
      });
      let game = this.session.game.getForSending();
      game.redraw = true;
      this.socket.emit(Messages.gameUpdate.rsp, game);
    }
  }

  tryShoot(dir) {
    if (this.role == ROLE_PLAYER) {
      let valid = this.session.tryShoot(dir, this.player);
      if (valid) {
        this.socket.emit(Messages.shoot.rsp, Messages.shoot.rst.ok);
        return;
      }
    }
    this.socket.emit(Messages.shoot.rsp, Messages.shoot.rst.nok);
  }

  disconnect() {
    this.session.onMemberDisconnected(this);
  }

  initialize(role, name, color) {
    console.log(role + " " + name + " " + color);
    this.player = new Octaball.Player(name, color);
    this.setRole(role);
    this.session.onMemberInitialized(this);
  }
}

class Session {
  constructor(gameString) {
    this.game = null;
    this.gameString = gameString;
    this.members = [];
    this.io = io.of('/' + gameString)
    this.io.on('connection', (socket) => this.onNewConnection(socket))
  }

  onNewConnection(socket) {
    //a new player wants to connect and initialize
    this.log("got new connection");
    this.members.push(new Member(socket, this));
  }

  getPlayers() {
    return this.members.filter(m => m.role == ROLE_PLAYER);
  }

  getNumberOfPlayers() {
    return this.getPlayers().length;
  }

  getNumberOfMembers() {
    return this.members.length;
  }

  hasTwoPlayers() {
    return this.getNumberOfPlayers() == 2;
  }

  hasGameRunning() {
    return this.game && !this.game.getWinner()
  }

  tryShoot(direction, player) {
    this.log(player.name + ' trying to shoot in ' + direction);
    if (this.hasGameRunning()) {
      let valid = this.game.tryShoot(direction, player);
      if (valid) {
        this.io.emit(Messages.gameUpdate.rsp, this.game.getForSending());
        let winner = this.game.getWinner()
        if (winner != null) {
          this.io.emit(Messages.gameInterrupt.rsp, {
            msg: Messages.gameInterrupt.rst.gameEnd,
            data: 'winner',
            player: winner
          });
        }
        return true;
      }
    }
    return false;
  }

  onMemberDisconnected(member) {
    let idx = this.members.indexOf(member);
    if (idx > -1) {
      this.members.splice(idx, 1);
    }
    if (!this.hasTwoPlayers()) {
      this.log('player disconnected, ending the game');
      this.io.emit(Messages.gameInterrupt.rsp, {
        msg: Messages.gameInterrupt.rst.gameEnd,
        data: 'disconnect'
      });
    }
    if (this.members.length == 0) {
      this.log('deleting');
      delete games[this.gameString];
      delete io.nsps['/' + this.gameString];
    }
  }

  onMemberInitialized(member) {
    //check if there are enough player to start a game
    if (this.hasTwoPlayers() && !this.hasGameRunning()) {
      let members = this.getPlayers();
      this.startNewGame(members[0].player, members[1].player);
    }
  }

  startNewGame(player0, player1) {
    if (this.game && this.game.getWinner()) {
      this.game = new Octaball.Game(player0, player1, this.game.getOtherPlayer(this.game.getWinner()));
    } else {
      this.game = new Octaball.Game(player0, player1, null);
    }
    this.io.emit(Messages.gameInterrupt.rsp, {
      msg: Messages.gameInterrupt.rst.gameStart
    });
    this.io.emit(Messages.gameUpdate.rsp, this.game.getForSending());
  }

  log(data) {
    console.log(this.gameString + ": " + data)
  }
}

function makeRandomGameString(length) {
  let gameString;
  do {
    gameString = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      gameString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }
  while (games[gameString] != null)
  return gameString;
}

function createNewGame() {
  let gameString = makeRandomGameString(5);
  console.log('Creating new game.. ' + gameString);
  games[gameString] = new Session(gameString);
  setInterval(deleteGame, 300000, gameString);
  return gameString;
}

function deleteGame(gameString) {
  if (games[gameString]) {
    if (games[gameString].members.length == 0) {
      console.log(gameString + ': deleting');
      delete games[gameString];
      delete io.nsps['/' + gameString];
    }
  }
}


io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on(Messages.createID.msg, function() {
    let gameID = createNewGame();
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
module.exports = app