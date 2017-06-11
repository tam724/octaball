var game;
var connection;
var socket;
var myplayername;


function connect(){
  var username = document.getElementById('input_name');
  var namespace = document.getElementById('input_namespace');
  var color = document.getElementById('input_color');
  username.disabled = true;
  namespace.disabled = true;
  color.disabled = true;

  socket = io('/'+namespace.value);
  socket.on('connect', initialize);
  socket.on('octaball error', function(err) {
    console.log(err);
  });
  socket.on('end game', endGame);
  socket.on('start game', startGame);
  socket.on('do shoot', shoot);
}

function initialize(){
  var username = document.getElementById('input_name');
  var color = document.getElementById('input_color');
  myplayername = username.value;
  socket.emit('initialize', {name: username.value, color: color.value});
}

function endGame(){
  document.getElementById('myCanvas').hidden = true;
  document.getElementById('div_status').innerHTML = 'Game ended!';
}

function startGame(ply){
  player0 = new Player(ply.player0.name,'#'+ply.player0.color);
  player1 = new Player(ply.player1.name,'#'+ply.player1.color);
  document.getElementById('myCanvas').hidden = false;
  game = new Game(player0, player1);
  game.draw();
  document.getElementById('div_status').innerHTML = 'Game started! Its ' + game.getActivePlayer().name + ' turn \n';
  document.addEventListener('keypress', onKeyPress,false);
}

var keyDict = {}; keyDict.q = 'G'; keyDict.w = 'F'; keyDict.e = 'E';
keyDict.d = 'D'; keyDict.c = 'C'; keyDict.x = 'B'; keyDict.y = 'A'; keyDict.a = 'H';

function onKeyPress(event){
  socket.emit('try shoot', {name: myplayername, direction: keyDict[event.key]});
}

function shoot(shoot){
  if(shoot.name == game.getActivePlayer().name){
    game.tryShoot(shoot.direction, game.getActivePlayer());
    game.draw();
    updateStatusDiv();
  }
  else{
    console.log('cannot do shoot');
  }
}

function updateStatusDiv(){
  if(game.getWinner()){
    document.getElementById('div_status').innerHTML = game.getWinner().name + ' wins this game!! Congratulations!!';
  }
  else{
    document.getElementById('div_status').innerHTML = 'Its ' + game.getActivePlayer().name + ' turn \n';
  }
}
