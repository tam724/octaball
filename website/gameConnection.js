var messages = new Messages();

function gameConnection(){
  this.gameID = null;
  this.gameSocket = null;
  this.connectedToRoom = false;

  this.createID = function(onIDReadyFunc){
    var socket = io();
    socket.on(messages.connect.rsp, function(){
      socket.on(messages.createID.rsp, function(gameID){
        socket.disconnect();
        socket = null;
        onIDReadyFunc(gameID);
      });
      socket.emit(messages.createID.msg);
    });
  }

  this.checkID = function(gameID, onIDCheckedFunc){
    var socket = io();
    socket.on(messages.connect.rsp, function(){
      socket.on(messages.checkID.rsp, function(result){
        socket.disconnect();
        socket = null;
        onIDCheckedFunc(result);
      });
      socket.emit(messages.checkID.msg, gameID);
    });

  }

  this.connectToRoom = function(gameID, onConnectedFunc, onRoomConnectedFunc){
    this.gameID = gameID;
    this.gameSocket = io('/' + this.gameID);
    this.gameSocket.on(messages.connect.rsp, onConnectedFunc);
    this.gameSocket.on(messages.roomConnected.rsp, onRoomConnectedFunc);
  }

  this.initializePlayer = function(player, onInitializedFunc, onGameUpdateFunc, onShootResponseFunc, onGameInterruptFunc){
    if(!this.isInitialized()){
      console.log('not connected to a room');
    }
    else{
      this.gameSocket.on(messages.initialize.rsp, onInitializedFunc);
      this.gameSocket.on(messages.gameUpdate.rsp, onGameUpdateFunc);
      this.gameSocket.on(messages.shoot.rsp, onShootResponseFunc);
      this.gameSocket.on(messages.gameInterrupt.rsp, onGameInterruptFunc);
      this.gameSocket.emit(messages.initialize.msg, player);
    }
  }

  this.shoot = function(direction){
    if(!this.isInitialized()){
      console.log('not connected to a room');
    }
    else{
      this.gameSocket.emit(messages.shoot.msg, direction);
    }
  }

  this.isInitialized = function(){
    return true;
  }
}
