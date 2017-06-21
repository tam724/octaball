/** layouts */
var lytCtr = new layoutController('div_parent');

// layout welcome
var welcomeLayout = new layout('welcome', 'layout_welcome.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputName = document.getElementById('input_name');
    this.inputColor = document.getElementById('input_color');
    this.inputOkay = document.getElementById('input_okay');
    this.inputRemember = document.getElementById('input_remember');

    //site controls
    this.pageControls = par.pageControls;

    //event listener
    this.inputOkay.addEventListener('click', this.onButtonOkay);
    this.inputColor.addEventListener('change', this.onRangeColor);
    this.inputColor.addEventListener('input', this.onRangeColor);

    //variables
    this.color = null;

    //initialize site
    this.pageControls.updateTitleFunc('octaball');
    this.pageControls.updateStatusFunc('type your name and choose a color');
    if (par.gameID) {
      this.gameID = par.gameID;
    }
    if (par.playerInfo) {
      this.color = par.playerInfo.color;
      this.inputName.value = par.playerInfo.name;
      this.onButtonOkay();
    }
  },
  function() {
    //dest
    this.inputOkay.removeEventListener('click', this.onButtonOkay);
    this.inputColor.removeEventListener('change', this.onRangeColor);
    this.inputColor.removeEventListener('input', this.onRangeColor);
  });
welcomeLayout.onButtonOkay = function() {
  if (welcomeLayout.inputName.value == '') {
    welcomeLayout.pageControls.updateStatusFunc('insert a name');
  } else if (!welcomeLayout.color) {
    welcomeLayout.pageControls.updateStatusFunc('choose a color');
  } else {
    if (welcomeLayout.inputRemember.checked) {
      localStorage.setItem('name', welcomeLayout.inputName.value);
      localStorage.setItem('color', welcomeLayout.color);
    }
    else{
      localStorage.removeItem('name');
      localStorage.removeItem('color');
    }
    if (welcomeLayout.gameID) {
      welcomeLayout.layoutController.changeLayout(connectLayout.name, {
        pageControls: welcomeLayout.pageControls,
        playerInfo: {
          name: welcomeLayout.inputName.value,
          color: welcomeLayout.color
        },
        gameID: welcomeLayout.gameID
      });
    } else {
      welcomeLayout.layoutController.changeLayout(mainLayout.name, {
        pageControls: welcomeLayout.pageControls,
        playerInfo: {
          name: welcomeLayout.inputName.value,
          color: welcomeLayout.color
        }
      });
    }
  }
}
welcomeLayout.onRangeColor = function() {
  var value = welcomeLayout.inputColor.value;
  welcomeLayout.color = getColorfromDouble(value);
  welcomeLayout.inputName.style.backgroundColor = welcomeLayout.color;
}

// layout main
var mainLayout = new layout('main', 'layout_main.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputCreate = document.getElementById('input_create');
    this.inputConnect = document.getElementById('input_connect');
    this.inputChangeName = document.getElementById('input_change_name');

    //site controls
    this.pageControls = par.pageControls;
    this.playerInfo = par.playerInfo;

    //event listener
    this.inputCreate.addEventListener('click', this.onButtonCreate);
    this.inputConnect.addEventListener('click', this.onButtonConnect);
    this.inputChangeName.addEventListener('click', this.onButtonChangeName);

    //variables

    //initialize site
    this.pageControls.updateTitleFunc('hi ' + this.playerInfo.name + ', this is octaball');
    this.pageControls.updateStatusFunc('create a new or connect to a existing game');

    this.pageControls.updateHashFunc('');
  },
  function() {
    //dest
    this.inputCreate.removeEventListener('click', this.onButtonCreate);
    this.inputConnect.removeEventListener('click', this.onButtonConnect);
  });
mainLayout.onButtonCreate = function() {
  mainLayout.layoutController.changeLayout(createLayout.name, {
    pageControls: mainLayout.pageControls,
    playerInfo: mainLayout.playerInfo
  });
}
mainLayout.onButtonConnect = function() {
  mainLayout.layoutController.changeLayout(connectLayout.name, {
    pageControls: mainLayout.pageControls,
    playerInfo: mainLayout.playerInfo
  });
}
mainLayout.onButtonChangeName = function() {
  mainLayout.layoutController.changeLayout(welcomeLayout.name, {
    pageControls: mainLayout.pageControls
  })
}

// layout create
var createLayout = new layout('create', 'layout_create.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputGameId = document.getElementById('input_game_id');
    this.inputBack = document.getElementById('input_back');
    this.divLoader = document.getElementById('div_loader');

    //site controls
    this.pageControls = par.pageControls;
    this.playerInfo = par.playerInfo;

    //event listener
    this.inputBack.addEventListener('click', this.onButtonBack);

    //variables

    //initialize site
    this.pageControls.updateTitleFunc('hi ' + this.playerInfo.name + ', this is octaball');
    this.pageControls.updateStatusFunc('creating a new game for you..');
    this.divLoader.style.borderTopColor = this.playerInfo.color;
    this.inputGameId.disabled = true;
    this.gameConnection = new gameConnection();
    this.createID();
  },
  function() {
    //dest
    this.inputBack.removeEventListener('click', this.onButtonBack);
  });
createLayout.onButtonBack = function() {
  createLayout.layoutController.changeLayout(mainLayout.name, {
    pageControls: createLayout.pageControls,
    playerInfo: createLayout.playerInfo
  });
}
createLayout.createID = function() {
  createLayout.gameConnection.createID(createLayout.onIDCreated);
}
createLayout.onIDCreated = function(gameID) {
  createLayout.gameConnection.connectToRoom(gameID, createLayout.onConnectedToRoom, createLayout.onRoomConnected);
}
createLayout.onConnectedToRoom = function() {
  //createLayout.layoutController.changeLayout()
  createLayout.inputGameId.value = createLayout.gameConnection.gameID;
  createLayout.pageControls.updateHashFunc(createLayout.gameConnection.gameID);
  createLayout.divLoader.hidden = true;
  createLayout.pageControls.updateStatusFunc('share this gameID with your friend');
}
createLayout.onRoomConnected = function() {
  //called when the room is filled with 2 people
  createLayout.layoutController.changeLayout(playingLayout.name, {
    pageControls: createLayout.pageControls,
    playerInfo: createLayout.playerInfo,
    gameConnection: createLayout.gameConnection
  });
}

// layout connect
var connectLayout = new layout('connect', 'layout_connect.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputGameId = document.getElementById('input_game_id');
    this.inputBack = document.getElementById('input_back');
    this.inputConnect = document.getElementById('input_connect');
    this.divLoader = document.getElementById('div_loader');

    //site controls
    this.pageControls = par.pageControls;
    this.playerInfo = par.playerInfo;

    //event listener
    this.inputBack.addEventListener('click', this.onButtonBack);
    this.inputConnect.addEventListener('click', this.onButtonConnect);

    //variables

    //initialize site
    this.pageControls.updateTitleFunc('hi ' + this.playerInfo.name + ', this is octaball');
    this.pageControls.updateStatusFunc('type a game id');
    this.divLoader.style.borderTopColor = this.playerInfo.color;

    this.gameConnection = new gameConnection();
    if (par.gameID) {
      this.inputGameId.value = par.gameID;
      this.onButtonConnect();
    }
  },
  function() {
    //dest
    this.inputBack.removeEventListener('click', this.onButtonBack);
    this.inputConnect.removeEventListener('click', this.onButtonConnect);
  });
connectLayout.onButtonBack = function() {
  connectLayout.layoutController.changeLayout(mainLayout.name, {
    pageControls: connectLayout.pageControls,
    playerInfo: connectLayout.playerInfo
  });
}
connectLayout.onButtonConnect = function() {
  var gameID = connectLayout.inputGameId.value;
  if (gameID && gameID != '' && gameID.length == 5) {
    connectLayout.inputGameId.disabled = true;
    connectLayout.divLoader.hidden = false;
    connectLayout.gameConnection.checkID(gameID, connectLayout.onCheckResult);
  } else {
    connectLayout.pageControls.updateStatusFunc('input a game id');
  }
}
connectLayout.onCheckResult = function(result) {
  if (result == messages.checkID.rst.ok) {
    connectLayout.divLoader.hidden = true;
    connectLayout.pageControls.updateStatusFunc('connecting to game');
    connectLayout.gameConnection.connectToRoom(connectLayout.inputGameId.value, connectLayout.onConnectedToRoom, connectLayout.onRoomConnected);
  } else if (result == messages.checkID.rst.error) {
    connectLayout.inputGameId.disabled = false;
    connectLayout.divLoader.hidden = true;
    connectLayout.pageControls.updateStatusFunc('this id does not exist');
  }
}
connectLayout.onConnectedToRoom = function() {
  connectLayout.pageControls.updateStatusFunc('connected');
  connectLayout.pageControls.updateHashFunc(connectLayout.gameConnection.gameID);
}
connectLayout.onRoomConnected = function() {
  //called when the room is filled with 2 people
  lytCtr.changeLayout(playingLayout.name, {
    pageControls: connectLayout.pageControls,
    playerInfo: connectLayout.playerInfo,
    gameConnection: connectLayout.gameConnection
  })
}

var playingLayout = new layout('playing', 'layout_playing.html', lytCtr, function(par) {
  // init
  // html elements
  this.canvasGame = document.getElementById('canvas_game');
  this.inputBack = document.getElementById('input_back');
  this.inputAgain = document.getElementById('input_again');
  //site controls
  this.pageControls = par.pageControls;
  this.playerInfo = par.playerInfo;
  this.gameConnection = par.gameConnection;

  //event listener
  this.inputBack.addEventListener('click', this.onButtonBack);
  //variables

  //initialize site
  playingLayout.inputAgain.hidden = true;
  this.initializeOnServer();
}, function() {
  //dest
  this.gameConnection.disconnect();
  this.inputBack.removeEventListener('click', this.onButtonBack);
  document.removeEventListener('keypress', this.onKeyPress, false);
});
playingLayout.onButtonBack = function() {
  playingLayout.layoutController.changeLayout(mainLayout.name, {
    pageControls: playingLayout.pageControls,
    playerInfo: playingLayout.playerInfo
  });
}
playingLayout.initializeOnServer = function() {
  playingLayout.gameConnection.initializePlayer(playingLayout.playerInfo, playingLayout.initialized, playingLayout.redrawCanvas, playingLayout.shootResponse, playingLayout.onGameInterrupt, playingLayout.onGameInfo);
}
playingLayout.initialized = function() {
  playingLayout.pageControls.updateStatusFunc('waiting for other player');
}
playingLayout.redrawCanvas = function(game) {
  drawFieldtoCanvas(playingLayout.canvasGame, game);
  if (game.activeplayer.name == playingLayout.playerInfo.name) {
    playingLayout.pageControls.updateStatusFunc('it\'s your turn');
  } else {
    playingLayout.pageControls.updateStatusFunc('it is ' + game.activeplayer.name + '\'s turn');
  }
}
playingLayout.shootResponse = function(response) {
  if (response == messages.shoot.rst.ok) {
    //well done
  } else if (response == messages.shoot.rst.gameWon) {
    console.log(messages.shoot.rst.gameWon);
  } else if (response == messages.shoot.rst.notYourTurn) {
    playingLayout.pageControls.updateStatusFunc('it\'s not your turn');
  } else if (response == messages.shoot.rst.occupied) {
    playingLayout.pageControls.updateStatusFunc('shoot already occupied');
  } else if (response == messages.shoot.rst.border) {
    playingLayout.pageControls.updateStatusFunc('shoot over border');
  }
}
playingLayout.onGameInterrupt = function(interrupt) {
  if (interrupt.msg == messages.gameInterrupt.rst.gameStart) {
    document.addEventListener('keypress', playingLayout.onKeyPress, false);
    playingLayout.inputAgain.hidden = true;
  } else if (interrupt.msg == messages.gameInterrupt.rst.gameEnd) {
    if (interrupt.data == 'disconnect') {
      playingLayout.pageControls.updateStatusFunc('the game ended, because someone disconnected');
      document.removeEventListener('keypress', playingLayout.onKeyPress, false);
    } else if (interrupt.data == 'winner') {
      playingLayout.pageControls.updateStatusFunc(interrupt.player.name + 'wins this game, congratulations!');
      document.removeEventListener('keypress', playingLayout.onKeyPress, false);
      playingLayout.inputAgain.hidden = false;
      playingLayout.inputAgain.addEventListener('click', function() {
        playingLayout.gameConnection.again();
      })
    }
  }
}
playingLayout.onGameInfo = function(info) {
  if (info.msg == messages.gameInfo.rst.again) {
    playingLayout.pageControls.updateStatusFunc(info.player + ' wants to play again');
  }
}
playingLayout.onKeyPress = function(event) {
  var direction = getDirectionfromKey(event.key);
  playingLayout.gameConnection.shoot(direction);
}

/** end layouts */

var divTitle = document.getElementById('div_title');
var divStatus = document.getElementById('div_status');

function updateTitle(text) {
  divTitle.innerHTML = text;
}

function updateStatus(text) {
  divStatus.innerHTML = text;
  //just to retrigger the status animation
  divStatus.classList.remove('updateStatusAnimation');
  void divStatus.offsetWidth;
  divStatus.classList.add('updateStatusAnimation');
}

function updateHash(gameID) {
  if (gameID == '') {
    window.location.hash = '';
  } else {
    window.location.hash = '#' + gameID;
  }
}

//helper functions
function getColorfromDouble(value) {
  var step = 100 / 3;
  var r, g, b;
  var max = 150;
  if (value < step) {
    r = 0;
    g = parseInt(value / step * max, 10);
    b = parseInt(max - value / step * max, 10);
  } else if (value < 2 * step) {
    b = 0;
    r = parseInt((value - step) / step * max, 10);
    g = parseInt(max - (value - step) / step * max, 10);
  } else {
    g = 0;
    b = parseInt((value - 2 * step) / step * max, 10);
    r = parseInt(max - (value - 2 * step) / step * max, 10);
  }
  mycolor = "#" + toHex(r) + toHex(g) + toHex(b);
  return mycolor;
}

function toHex(value) {
  var hex = (value).toString(16);
  while (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex;
}

function drawFieldtoCanvas(canvas, game) {
  var context = canvas.getContext("2d");
  var width = canvas.width;
  var height = canvas.height;

  context.clearRect(0, 0, width, height);

  var width_ = width / 13;
  var height_ = height / 9;

  //quadrillpaper
  context.beginPath()
  for (var i = 0; i < 13; i++) {
    context.moveTo(i * width_ + width_ / 2, 0);
    context.lineTo(i * width_ + width_ / 2, height);
  }
  for (var i = 0; i < 9; i++) {
    context.moveTo(0, i * height_ + height_ / 2);
    context.lineTo(width, i * height_ + height_ / 2);
  }
  context.strokeStyle = '#A9D0F5';
  context.lineWidth = 1;
  context.stroke();

  //border
  context.beginPath();
  context.moveTo(1 * width_ + width_ / 2, 3 * height_ + height_ / 2);
  context.lineTo(1 * width_ + width_ / 2, 0 * height_ + height_ / 2);
  context.lineTo(11 * width_ + width_ / 2, 0 * height_ + height_ / 2);
  context.lineTo(11 * width_ + width_ / 2, 3 * height_ + height_ / 2);

  context.moveTo(11 * width_ + width_ / 2, 5 * height_ + height_ / 2);
  context.lineTo(11 * width_ + width_ / 2, 8 * height_ + height_ / 2);
  context.lineTo(1 * width_ + width_ / 2, 8 * height_ + height_ / 2);
  context.lineTo(1 * width_ + width_ / 2, 5 * height_ + height_ / 2);

  context.strokeStyle = '#000000';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(1 * width_ + width_ / 2, 3 * height_ + height_ / 2);
  context.lineTo(0 * width_ + width_ / 2, 3 * height_ + height_ / 2);
  context.lineTo(0 * width_ + width_ / 2, 5 * height_ + height_ / 2);
  context.lineTo(1 * width_ + width_ / 2, 5 * height_ + height_ / 2);

  context.strokeStyle = game.player.player0.color;
  context.stroke();

  context.beginPath();
  context.moveTo(11 * width_ + width_ / 2, 3 * height_ + height_ / 2);
  context.lineTo(12 * width_ + width_ / 2, 3 * height_ + height_ / 2);
  context.lineTo(12 * width_ + width_ / 2, 5 * height_ + height_ / 2);
  context.lineTo(11 * width_ + width_ / 2, 5 * height_ + height_ / 2);

  context.strokeStyle = game.player.player1.color;
  context.stroke();

  for (var i = 0; i < game.shoots.length; i++) {
    var shoot = game.shoots[i];
    var pointA = {
      x: shoot.a.x * width_ + width_ / 2,
      y: shoot.a.y * height_ + height_ / 2
    };
    var pointB = {
      x: shoot.b.x * width_ + width_ / 2,
      y: shoot.b.y * height_ + height_ / 2
    };
    context.beginPath();
    context.moveTo(pointA.x, pointA.y, 5, 5);
    context.lineTo(pointB.x, pointB.y, 5, 5);
    context.strokeStyle = shoot.p;
    context.lineWidth = 3;
    context.stroke();
  }

  context.beginPath();
  context.strokeStyle = game.activeplayer.color;
  context.rect(game.ball.x * width_ + width_ / 2 - 5, game.ball.y * height_ + height_ / 2 - 5, 10, 10);
  context.stroke();

  context.strokeStyle = '#000000';
}

function getDirectionfromKey(key) {
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
  return keyDict[key];
}

//main script
lytCtr.registerLayout(welcomeLayout);
lytCtr.registerLayout(mainLayout);
lytCtr.registerLayout(createLayout);
lytCtr.registerLayout(connectLayout);
lytCtr.registerLayout(playingLayout);
var par = {
  pageControls: {
    updateTitleFunc: updateTitle,
    updateStatusFunc: updateStatus,
    updateHashFunc: updateHash
  },
};
if (window.location.hash != '') {
  var gameID = window.location.hash.substring(1, window.location.hash.length);
  par.gameID = gameID;
}
if (localStorage.getItem('name') != null && localStorage.getItem('color') != null) {
  par.playerInfo = {
    name: localStorage.getItem('name'),
    color: localStorage.getItem('color')
  }
}
lytCtr.initializeLayout(welcomeLayout.name, par);
