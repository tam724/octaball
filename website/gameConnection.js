var messages = new Messages();

function gameConnection() {
  this.gameID = null;
  this.gameSocket = null;
  this.connectedToRoom = false;
  this.shooting = false;
  this.gameType = null;
  this.offlineSingleGame = null;

  this.createID = function(onIDReadyFunc) {
    var socket = io();
    socket.on(messages.connect.rsp, function() {
      socket.on(messages.createID.rsp, function(gameID) {
        socket.disconnect();
        socket = null;
        onIDReadyFunc(gameID);
      });
      socket.emit(messages.createID.msg);
    });
  }

  this.checkID = function(gameID, onIDCheckedFunc) {
    var socket = io();
    socket.on(messages.connect.rsp, function() {
      socket.on(messages.checkID.rsp, function(result) {
        socket.disconnect();
        socket = null;
        onIDCheckedFunc(result);
      });
      socket.emit(messages.checkID.msg, gameID);
    });

  }

  this.connectToRoom = function(gameID, onConnectedFunc, onRoomConnectedFunc) {
    this.gameID = gameID;
    this.gameSocket = io('/' + this.gameID);
    this.gameSocket.on(messages.connect.rsp, onConnectedFunc);
    this.gameSocket.on(messages.roomConnected.rsp, onRoomConnectedFunc);
  }

  this.initializePlayer = function(player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc, onGameInfoFunc, gameType = 'online') {
    this.gameType = gameType;
    if (gameType == 'offlineSingle') {
      this.offlineSingleGame = {};
      this.offlineSingleGame.player0 = new Player();
      this.offlineSingleGame.player0.initialize(player.name, player.color);
      this.offlineSingleGame.player1 = new Player();
      this.offlineSingleGame.player1.initialize('Computer', '#000000');
      this.offlineSingleGame.game = new Game(this.offlineSingleGame.player0, this.offlineSingleGame.player1);
      this.offlineSingleGame.onGameUpdateFunc = onGameUpdateFunc;
      this.offlineSingleGame.onShootResponseFunc = onShootResponseFunc;
      this.offlineSingleGame.onGameInterruptFunc = onGameInterruptFunc;
      this.offlineSingleGame.onGameInfoFunc = onGameInfoFunc;
      onInitializedFunc();
      this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
      this.offlineSingleGame.onGameInterruptFunc({
        msg: messages.gameInterrupt.rst.gameStart
      });
    } else if (this.gameSocket && gameType == 'online') {
      this.gameSocket.on(messages.initialize.rsp, onInitializedFunc);
      this.gameSocket.on(messages.gameUpdate.rsp, onGameUpdateFunc);
      this.gameSocket.on(messages.shoot.rsp, (function(msg) {
        this.shooting = false;
        onShootResponseFunc(msg);
      }).bind(this));
      this.gameSocket.on(messages.gameInterrupt.rsp, onGameInterruptFunc);
      this.gameSocket.on(messages.gameInfo.rsp, onGameInfoFunc);
      this.gameSocket.emit(messages.initialize.msg, player);
    } else {
      console.log('cannot initializePlayer');
    }
  }

  this.shoot = function(direction) {
    if (this.gameType == 'online' && this.gameSocket) {
      if (this.shooting) {
        return false;
      } else {
        this.shooting = true;
        this.gameSocket.emit(messages.shoot.msg, direction);
      }
      return true;
    } else if (this.gameType == 'offlineSingle') {
      var shootResult = this.offlineSingleGame.game.tryShoot(direction, this.offlineSingleGame.player0); //player0 should always be the human player
      if (shootResult.msg == 'OK') {
        //alright shoot done
        this.offlineSingleGame.onShootResponseFunc(messages.shoot.rst.ok);
        this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
        if (this.offlineSingleGame.game.winner != null) {
          this.offlineSingleGame.onGameInterruptFunc({
            msg: messages.gameInterrupt.rst.gameEnd,
            data: 'winner',
            player: this.offlineSingleGame.game.winner
          });
        }
        if (this.offlineSingleGame.game.activeplayer == this.offlineSingleGame.player1) { // player1 should always be the computer player
          var gameAI = new GameAI(this.offlineSingleGame.game, this.offlineSingleGame.player1);
          var shoot = gameAI.computeShoot();
          for (var i = 0; i < shoot.length; i++) {
            var aiShootResult = this.offlineSingleGame.game.tryShoot(shoot[i], this.offlineSingleGame.player1);
            if (aiShootResult.msg != 'OK' && aiShootResult.msg != 'GameWon') {
              console.log('strange ai shoot');
            }
          }
          this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
          if (this.offlineSingleGame.game.winner != null) {
            this.offlineSingleGame.onGameInterruptFunc({
              msg: messages.gameInterrupt.rst.gameEnd,
              data: 'winner',
              player: this.offlineSingleGame.game.winner
            });
          }
        }
      } else if (shootResult.msg == 'GameWon') {
        this.offlineSingleGame.onShootResponseFunc(messages.shoot.rst.gameWon);
      } else if (shootResult.msg == 'NotYourTurn') {
        this.offlineSingleGame.onShootResponseFunc(messages.shoot.rst.notYourTurn);
      } else if (shootResult.msg == 'ShootOccupied') {
        this.offlineSingleGame.onShootResponseFunc(messages.shoot.rst.occupied);
      } else if (shootResult.msg == 'Border') {
        this.offlineSingleGame.onShootResponseFunc(messages.shoot.rst.border);
      } else {
        console.log('strange shoot Result: ' + shootResult);
      }
      return true;
    }
  }

  this.again = function() {
    if (this.gameType == 'online' && this.gameSocket) {
      this.gameSocket.emit(messages.gameInfo.msg, messages.gameInfo.rst.again);
    } else if (this.gameType == 'offlineSingle') {
      this.offlineSingleGame.game = new Game(this.offlineSingleGame.player0, this.offlineSingleGame.player1);
      this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
      this.offlineSingleGame.onGameInterruptFunc({
        msg: messages.gameInterrupt.rst.gameStart
      });
    }
  }

  this.disconnect = function() {
    if (gameType = 'online' && this.gameSocket) {
      this.gameSocket.disconnect();
    } else if (gameType == 'offlineSingle') {
      this.offlineSingleGame = null;
    }
  }
}
