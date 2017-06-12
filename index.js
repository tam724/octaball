var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var files = [{name: '/', path: '/index.html'},
            {name: '/game/octaball.js', path: '/game/octaball.js'},
            {name: '/game/game.js', path: '/game/game.js'},
            {name: '/game/ball.js', path: '/game/ball.js'},
            {name: '/game/player.js', path: '/game/player.js'},
            {name: '/game/point.js', path: '/game/point.js'},
            {name: '/game/shoot.js', path: '/game/shoot.js'}];

for(var i = 0; i < files.length; i++){
  app.get(files[i].name, function(path) {return function(req,res){
    res.sendFile(__dirname + path);
  }}(files[i].path));
}

var game1 = {started: false, player0: {connected: false, initialized: false}, player1: {connected: false, initialized: false}};
game1.io = io.of('/game1');
game1.io.on('connection', function(socket){
  console.log('someone connected to game1');
  var player = null;
  if(!game1.player0.connected){
    player = game1.player0;
    player.connected = true;
  }
  else if(!game1.player1.connected){
    player = game1.player1;
    player.connected = true;
  }
  else{
    socket.emit('octaball error','game is already full');
  }
  socket.on('disconnect', function(){
    if(player){
      player.connected = false;
      player.initialized = false;
      console.log(player.name + ' disconnected, ending the game');
      game1.io.emit('end game');
    }
    console.log('someone disconnected from game1');
  });
  socket.on('initialize', function(ply){
    if(player){
      player.name = ply.name;
      player.color = ply.color;
      player.initialized = true;
      console.log(player.name + ' initialized with color ' + player.color);
      if(game1.player0.initialized && game1.player1.initialized){
        console.log('starting the game');
        game1.io.emit('start game', {player0: game1.player0, player1: game1.player1});
      }
    }
  });
  socket.on('try shoot', function(shoot){
    console.log(shoot.name + ' trying to shoot in ' + shoot.direction);
    game1.io.emit('do shoot', shoot);
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
