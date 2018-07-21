"use strict"
let messages = new Messages();
const address = 'https://octaball-server-octaball.7e14.starter-us-west-2.openshiftapps.com' // '/'
const ROLE_SPECTATOR = 0
const ROLE_PLAYER = 1

class OnlineGameConnection {
  constructor() {
    this.gameID = null;
    this.gameSocket = null;
    this.connectedToRoom = false;
    this.shooting = false;
  }

  createID(onIDReadyFunc) {
    let socket = io(address);
    socket.on('connect', function() {
      socket.on(messages.createID.rsp, function(gameID) {
        socket.disconnect();
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
        onIDCheckedFunc(result);
      });
      socket.emit(messages.checkID.msg, gameID);
    });
  }

  connectToSession(gameID, player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc, onGameInfoFunc) {
    this.gameID = gameID;
    this.gameSocket = io(address + this.gameID);
    this.gameSocket.on(messages.connect.rsp, () => {
      this.gameSocket.on(messages.initialize.rsp, onInitializedFunc);
      this.gameSocket.on(messages.gameUpdate.rsp, onGameUpdateFunc);
      this.gameSocket.on(messages.shoot.rsp, (msg) => {
        this.shooting = false;
        onShootResponseFunc(msg);
      });
      this.gameSocket.on(messages.gameInterrupt.rsp, onGameInterruptFunc);
      this.gameSocket.on(messages.gameInfo.rsp, onGameInfoFunc);
      console.log('initializing');
      this.gameSocket.emit(messages.initialize.msg, {
        role: ROLE_PLAYER,
        name: player.name,
        color: player.color
      });
    });
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

class OfflineSingleGameConnection {
  constructor() {
    this.game = null;
    this.player0 = null;
    this.player1 = null;
    this.onGameUpdateFunc = null;
    this.onShootResponseFunc = null;
    this.onGameInterruptFunc = null;
    this.onGameInfoFunc = null;
    this.timeout = null;
  }
  connectToSession(gameID, player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc, onGameInfoFunc) {
    this.player0 = new Player(player.name, player.color);
    this.player1 = new Player('Computer', '#000000');
    this.game = new Game(this.player0, this.player1);
    this.onGameUpdateFunc = onGameUpdateFunc;
    this.onShootResponseFunc = onShootResponseFunc;
    this.onGameInterruptFunc = onGameInterruptFunc;
    this.onGameInfoFunc = onGameInfoFunc;
    onInitializedFunc();
    this.onGameInterruptFunc({
      msg: messages.gameInterrupt.rst.gameStart
    });
    this.onGameUpdateFunc(this.game.getForSending());
    if (this.game.activeplayer == this.player1) { // player1 should always be the computer player
      this.timeout = setTimeout(() => this.doAIShoots(), 1000);
    }
  }

  shoot(direction) {
    let valid = this.game.tryShoot(direction, this.player0); //player0 should always be the human player
    if (valid) {
      //alright shoot done
      this.onShootResponseFunc(messages.shoot.rst.ok);
      this.onGameUpdateFunc(this.game.getForSending());
      let winner = this.game.getWinner()
      if (winner != null) {
        this.onGameInterruptFunc({
          msg: messages.gameInterrupt.rst.gameEnd,
          data: 'winner',
          player: winner
        });
      }
      if (this.game.activeplayer == this.player1) { // player1 should always be the computer player
        this.timeout = setTimeout(() => this.doAIShoots(), 1000);
      }
    } else {
      this.onShootResponseFunc(messages.shoot.rst.nok);
    }
    return true;
  }

  again() {
    if (this.game && this.game.winner) {
      this.game = new Game(this.player0, this.player1, this.game.getOtherPlayer(this.game.winner));
    } else {
      this.game = new Game(this.player0, this.player1, null);
    }
    this.onGameUpdateFunc(this.game.getForSending());
    this.onGameInterruptFunc({
      msg: messages.gameInterrupt.rst.gameStart
    });
    if (this.game.activeplayer == this.player1) { // player1 should always be the computer player
      this.timeout = setTimeout(() => this.doAIShoots(), 1000);
    }
  }

  disconnect() {
    this.game = null;
    this.player0 = null;
    this.player1 = null;
    this.onGameUpdateFunc = null;
    this.onShootResponseFunc = null;
    this.onGameInterruptFunc = null;
    this.onGameInfoFunc = null;
    clearTimeout(this.timeout);
  }

  doAIShoots() {
    let gameAI = new GameAI(this.game, this.player1);
    let shoot = gameAI.computeShoot().reverse();
    this.timeout = setTimeout(() => this.doAIShoot(shoot), 100);
  }

  doAIShoot(shoot) {
    let aiShootValid = this.game.tryShoot(shoot.pop(), this.player1);
    if (!aiShootValid) {
      console.log('strange ai shoot: ' + aiShootValid);
    }
    this.onGameUpdateFunc(this.game.getForSending());
    let winner = this.game.getWinner()
    if (winner != null) {
      this.onGameInterruptFunc({
        msg: messages.gameInterrupt.rst.gameEnd,
        data: 'winner',
        player: winner
      });
    }
    if (shoot.length != 0) {
      this.timeout = setTimeout(() => this.doAIShoot(shoot), 300);
    }
  }
}
