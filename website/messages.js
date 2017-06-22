function Messages(){
  this.connect = {rsp: 'connect'};
  this.createID = {msg: 'createID', rsp: 'IDcreated'}; // response includes the gameID
  this.checkID = {msg:'checkID', rsp: 'IDchecked', rst: {ok: 'OK', error: 'ERROR'}};
  this.roomConnected = {rsp: 'roomConnected'};
  this.initialize = {msg: 'initialize', rsp: 'initialized'};
  this.gameUpdate = {rsp: 'gameUpdate'};
  this.gameInterrupt = {rsp: 'gameInterrupt', rst: {gameStart: 'gameStart', gameEnd: 'gameEnd'}}; //interrupts can contain more information..
  this.gameInfo = {msg: 'gameInfo', rsp: 'gameInfo', rst:{again:'again'}};
  this.shoot = {msg: 'shoot', rsp: 'shoot', rst: {ok: 'OK', gameWon: 'gameWon', notYourTurn: 'notYourTurn', occupied: 'shootOccupied', border: 'border'}};
}

//export only in node.js
if(typeof module !== 'undefined'){
  module.exports = Messages;
}
