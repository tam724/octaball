var game;
var connection;
var socket;
var player;

function connectToNewOnlineGame(onConnected) {
  socket = io();
  socket.on('gameString', function(game_id) {
    socket.disconnect();
    connectToOnlineGame(myname, game_id, mycolor, onConnected);
  });
  socket.emit('new game');
}

var ons = {
  octaballError: 'octaball error',
  endGame: 'end game',
  startGame: 'start game',
  gameUpdate: 'gameUpdate',
  shootResult: 'shootResult'
};

function connectToOnlineGame(name, game_id, color, onConnected) {
  if (socket) {
    socket.disconnect();
  }
  socket = io('/' + game_id);
  socket.on('connect', function(){
    socket.emit('initialize', {
      name: name,
      color: color
    });
    onConnected(game_id);
  });
  socket.on(ons.octaBallError, function(err) {
    alert(err);
  });
  socket.on(ons.endGame, endGame);
  socket.on(ons.startGame, startGame);
  socket.on(ons.gameUpdate, drawField);
  socket.on(ons.shootResult, function(err){window.alert(err);});
}

function drawField(field){
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  var width = c.width;
  var height = c.height;

  ctx.clearRect(0, 0, width, height);

  var width_ = width/13;
  var height_ = height/9;

  //quadrillpaper
  ctx.beginPath()
  for(var i = 0; i < 13; i++){
    ctx.moveTo(i*width_ + width_/2,0);
    ctx.lineTo(i*width_ + width_/2,height);
  }
  for(var i = 0; i < 9; i++){
    ctx.moveTo(0,i*height_ + height_/2);
    ctx.lineTo(width,i*height_ + height_/2);
  }
  ctx.strokeStyle = '#A9D0F5';
  ctx.lineWidth = 1;
  ctx.stroke();

  //border
  ctx.beginPath();
  ctx.moveTo(1*width_ + width_/2, 3*height_ + height_/2);
  ctx.lineTo(1*width_ + width_/2, 0*height_ + height_/2);
  ctx.lineTo(11*width_ + width_/2, 0*height_ + height_/2);
  ctx.lineTo(11*width_ + width_/2, 3*height_ + height_/2);

  ctx.moveTo(11*width_ + width_/2, 5*height_ + height_/2);
  ctx.lineTo(11*width_ + width_/2, 8*height_ + height_/2);
  ctx.lineTo(1*width_ + width_/2, 8*height_ + height_/2);
  ctx.lineTo(1*width_ + width_/2, 5*height_ + height_/2);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(1*width_ + width_/2, 3*height_ + height_/2);
  ctx.lineTo(0*width_ + width_/2, 3*height_ + height_/2);
  ctx.lineTo(0*width_ + width_/2, 5*height_ + height_/2);
  ctx.lineTo(1*width_ + width_/2, 5*height_ + height_/2);

  ctx.strokeStyle = player.player0.color;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(11*width_ + width_/2, 3*height_ + height_/2);
  ctx.lineTo(12*width_ + width_/2, 3*height_ + height_/2);
  ctx.lineTo(12*width_ + width_/2, 5*height_ + height_/2);
  ctx.lineTo(11*width_ + width_/2, 5*height_ + height_/2);

  ctx.strokeStyle = player.player1.color;
  ctx.stroke();

  for(var i = 0; i < field.shoots.length; i++){
    var shoot = field.shoots[i];
    var pointA = {x: shoot.a.x*width_ + width_/2 , y: shoot.a.y*height_ + height_/2};
    var pointB = {x: shoot.b.x*width_ + width_/2 , y: shoot.b.y*height_ + height_/2};
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y, 5, 5);
    ctx.lineTo(pointB.x, pointB.y, 5, 5);
    ctx.strokeStyle = shoot.p;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = field.ball.p;
  ctx.rect(field.ball.x*width_ + width_/2 - 5, field.ball.y*height_ + height_/2 - 5, 10, 10);
  ctx.stroke();

  ctx.strokeStyle = '#000000';
}

function endGame() {
  gotoMainMenu();
}

var keyDict = {
  q: 'G',
  w: 'F',
  e: 'E',
  d: 'D',
  c: 'C',
  x: 'B',
  y: 'A',
  a: 'H'
};

function startGame(ply) {
  player = ply;
  showCanvas();
  document.addEventListener('keypress', function(event) {
    socket.emit('shoot', keyDict[event.key]);
  }, false);
}

/** page interaction */
var button_create_online;
var button_connect_online;
var button_back;
var button_connect;
var button_ok;

var div_game_id;
var div_name;
var div_color;
var div_title;

var input_game_id;
var text_game_id;

var canvas;

function initialize(){
  button_create_online = document.getElementById('button_create_online');
  button_connect_online = document.getElementById('button_connect_online');
  button_connect = document.getElementById('button_connect');
  button_back = document.getElementById('button_back');
  button_ok = document.getElementById('button_ok')

  div_title = document.getElementById('div_title');
  div_game_id = document.getElementById('div_game_id');
  div_name = document.getElementById('div_name');
  div_color = document.getElementById('div_color');

  input_game_id = document.getElementById('input_game_id');
  input_color = document.getElementById('input_color');

  canvas = document.getElementById('canvas');
}
/** buttons */
var myname;
var mycolor;
function on_button_ok(){
  myname = input_name.value;
  if(!mycolor || myname == ''){
    alert('please input name and color');
    return;
  }
  div_name.hidden = true;
  div_color.hidden = true;
  gotoMainMenu();
}

function on_button_create_online(){
  button_create_online.disabled = true;
  button_connect_online.disabled = true;
  connectToNewOnlineGame(function(gameString){
    button_create_online.hidden = true;
    button_connect_online.hidden = true;

    button_back.hidden = false;

    div_game_id.hidden = false;
    input_game_id.value = gameString;
    input_game_id.disabled = true;
  })
}

function on_button_connect_online(){
  button_create_online.hidden = true;
  button_connect_online.hidden = true;
  button_connect.hidden = false;
  button_back.hidden = false;

  div_game_id.hidden = false;
  input_game_id.disabled = false;
}

function on_button_back(){
  gotoMainMenu();
}

function on_button_connect(){
  var game_id = input_game_id.value;

  if(game_id == '' || game_id.length > 5){
    window.alert('Check your inputs');
    return;
  }
  connectToOnlineGame(myname, game_id, mycolor, function(){
    button_connect.hidden = true;
    input_game_id.disabled = true;
  });
}

function input_color_change(value){
  var step = 100/3;
  var r,g,b;
  var max = 150;
  if(value < step){
    r = 0;
    g = parseInt(value/step*max,10);
    b = parseInt(max - value/step*max,10);
  }
  else if(value < 2*step){
    b = 0;
    g = parseInt((value-step)/step*max,10);
    r = parseInt(max - (value-step)/step*max,10);
  }
  else{
    g = 0;
    b = parseInt((value-2*step)/step*max,10);
    r = parseInt(max - (value-2*step)/step*max,10);
  }
  mycolor = "#"+toHex(r)+toHex(g)+toHex(b);
  console.log(mycolor);
  input_name.style.backgroundColor = mycolor;
}

function toHex(value){
  var hex = (value).toString(16);
  while(hex.length < 2){
    hex = hex + '0';
  }
  return hex;
}
/** helper */
function gotoMainMenu(){
  if (socket) {
    socket.disconnect();
  }
  div_title.innerHTML = 'hi ' + myname + ', this is octaball';
  div_title.style.color = mycolor;

  button_create_online.hidden = false;
  button_connect_online.hidden = false;
  button_create_online.disabled = false;
  button_connect_online.disabled = false;

  button_connect.hidden = true;
  canvas.hidden = true;
  button_back.hidden = true;
  div_game_id.hidden = true;
  input_game_id.value = '';
  button_ok.hidden = true;
}

function showCanvas(){
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  canvas.hidden = false;
}
