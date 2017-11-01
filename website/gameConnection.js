"use strict"
let messages = new Messages();
const address = '/' //'https://octaball-octaball.1d35.starter-us-east-1.openshiftapps.com/' // ''

class GameConnection {
  constructor() {}
  initializePlayer() {
    console.error('Function not implemented');
  }
  shoot(direction) {
    console.error('Function not implemented');
  }
  again() {
    console.error('Function not implemented');
  }
  disconnect() {
    console.error('Function not implemented');
  }
}

class OnlineGameConnection extends GameConnection {
  constructor() {
    super();
    this.gameID = null;
    this.gameSocket = null;
    this.connectedToRoom = false;
    this.shooting = false;
  }

  createID(onIDReadyFunc) {
    let socket = io(address);
    socket.on(messages.connect.rsp, function() {
      socket.on(messages.createID.rsp, function(gameID) {
        socket.disconnect();
        socket = null;
        onIDReadyFunc(gameID);
      });
      socket.emit(messages.createID.msg);
    });
  }

  checkID(gameID, onIDCheckedFunc) {
    let socket = io(address);
    socket.on(messages.connect.rsp, function() {
      socket.on(messages.checkID.rsp, function(result) {
        socket.disconnect();
        socket = null;
        onIDCheckedFunc(result);
      });
      socket.emit(messages.checkID.msg, gameID);
    });

  }

  connectToRoom(gameID, onConnectedFunc, onRoomConnectedFunc) {
    this.gameID = gameID;
    this.gameSocket = io(address + this.gameID);
    this.gameSocket.on(messages.connect.rsp, onConnectedFunc);
    this.gameSocket.on(messages.roomConnected.rsp, onRoomConnectedFunc);
  }

  initializePlayer(player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc, onGameInfoFunc) {
    if (this.gameSocket) {
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

  shoot(direction) {
    if (this.gameSocket) {
      if (this.shooting) {
        return false;
      } else {
        this.shooting = true;
        this.gameSocket.emit(messages.shoot.msg, direction);
      }
      return true;
    }
  }

  again() {
    if (this.gameSocket) {
      this.gameSocket.emit(messages.gameInfo.msg, messages.gameInfo.rst.again);
    }
  }

  disconnect() {
    if (this.gameSocket) {
      this.gameSocket.disconnect();
    }
  }
}

class OfflineSingleGameConnection extends GameConnection {
  constructor() {
    super();
    this.offlineSingleGame = null;
  }

  initializePlayer(player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc, onGameInfoFunc) {
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
    this.offlineSingleGame.onGameInterruptFunc({
      msg: messages.gameInterrupt.rst.gameStart
    });
    this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
    if (this.offlineSingleGame.game.activeplayer == this.offlineSingleGame.player1) { // player1 should always be the computer player
      setTimeout(this.doAIShoots.bind(this), 1000);
    }
  }

  shoot(direction) {
    let shootResult = this.offlineSingleGame.game.tryShoot(direction, this.offlineSingleGame.player0); //player0 should always be the human player
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
        setTimeout(this.doAIShoots.bind(this), 1000);
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

  again() {
    if (this.offlineSingleGame.game && this.offlineSingleGame.game.winner) {
      this.offlineSingleGame.game = new Game(this.offlineSingleGame.player0, this.offlineSingleGame.player1, this.offlineSingleGame.game.getOtherPlayer(this.offlineSingleGame.game.winner));
    } else {
      this.offlineSingleGame.game = new Game(this.offlineSingleGame.player0, this.offlineSingleGame.player1, null);
    }
    this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
    this.offlineSingleGame.onGameInterruptFunc({
      msg: messages.gameInterrupt.rst.gameStart
    });
    if (this.offlineSingleGame.game.activeplayer == this.offlineSingleGame.player1) { // player1 should always be the computer player
      setTimeout(this.doAIShoots.bind(this), 1000);
    }
  }

  disconnect() {
    this.offlineSingleGame = null;
  }

  doAIShoots() {
    let gameAI = new GameAI(this.offlineSingleGame.game, this.offlineSingleGame.player1);
    let shoot = gameAI.computeShoot().reverse();
    setTimeout(this.doAIShoot.bind(this, shoot), 100);
  }

  doAIShoot(shoot) {
    let aiShootResult = this.offlineSingleGame.game.tryShoot(shoot.pop(), this.offlineSingleGame.player1);
    if (aiShootResult.msg != 'OK' && aiShootResult.msg != 'GameWon') {
      console.log('strange ai shoot');
    }
    this.offlineSingleGame.onGameUpdateFunc(this.offlineSingleGame.game.getForSending());
    if (this.offlineSingleGame.game.winner != null) {
      this.offlineSingleGame.onGameInterruptFunc({
        msg: messages.gameInterrupt.rst.gameEnd,
        data: 'winner',
        player: this.offlineSingleGame.game.winner
      });
    }
    if (shoot.length != 0) {
      setTimeout(this.doAIShoot.bind(this, shoot), 300);
    }
  }
}
