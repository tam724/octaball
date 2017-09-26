window.onerror = function(messageOrEvent, source, lineno, colno, error) {
  if (confirm('on snap!\nyou just found an error\ndo you want to send it to the developer?')) {
    var body = document.getElementById('body');
    body.innerHTML = 'open a new issue on <a href="http://www.github.com/tam724/octaball/issues">github</a> or send me an <a href="mailto:tamme-c@gmx.de?Subject=octaball error&Body=' + error.stack + '">email</a> (tamme-c@gmx.de): </br></br>'
    body.innerHTML += error.stack;
  }
  return false;
}
/** layouts */
var lytCtr = new layoutController('div_parent');

// layout welcome
var welcomeLayout = new layout('welcome', 'website/layout_welcome.html', lytCtr, function(par) {
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
    this.inputRemember.checked = true;
    if (par.gameID) {
      this.gameID = par.gameID;
    } else {
      this.gameID = null;
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
    } else {
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
var mainLayout = new layout('main', 'website/layout_main.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputCreate = document.getElementById('input_create');
    this.inputConnect = document.getElementById('input_connect');
    this.inputChangeName = document.getElementById('input_change_name');
    this.inputSingleplayer = document.getElementById('input_singleplayer');

    //site controls
    this.pageControls = par.pageControls;
    this.playerInfo = par.playerInfo;

    //event listener
    this.inputCreate.addEventListener('click', this.onButtonCreate);
    this.inputConnect.addEventListener('click', this.onButtonConnect);
    this.inputChangeName.addEventListener('click', this.onButtonChangeName);
    this.inputSingleplayer.addEventListener('click', this.onButtonSingleplayer);

    //variables

    //initialize site
    this.pageControls.updateTitleFunc('octaball');
    this.pageControls.updateStatusFunc('hi ' + this.playerInfo.name);

    this.pageControls.updateHashFunc('');
  },
  function() {
    //dest
    this.inputCreate.removeEventListener('click', this.onButtonCreate);
    this.inputConnect.removeEventListener('click', this.onButtonConnect);
    this.inputSingleplayer.removeEventListener('click', this.onButtonSingleplayer);
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
  });
}
mainLayout.onButtonSingleplayer = function() {
  mainLayout.layoutController.changeLayout(playingLayout.name, {
    pageControls: mainLayout.pageControls,
    playerInfo: mainLayout.playerInfo,
    gameType: 'offlineSingle',
    gameConnection: new gameConnection()
  })
}

// layout create
var createLayout = new layout('create', 'website/layout_create.html', lytCtr, function(par) {
    // init
    // html elements
    this.inputGameId = document.getElementById('input_game_id');
    this.inputBack = document.getElementById('input_back');
    this.divLoader = document.getElementById('div_loader');
    this.aShareWhatsapp = document.getElementById('a_share_whatsapp');
    this.aShareTelegram = document.getElementById('a_share_telegram');
    this.aShareMail = document.getElementById('a_share_mail');

    //site controls
    this.pageControls = par.pageControls;
    this.playerInfo = par.playerInfo;

    //event listener
    this.inputBack.addEventListener('click', this.onButtonBack);
    //variables

    //initialize site
    this.pageControls.updateStatusFunc('creating a new game for you..');
    this.divLoader.style.borderTopColor = this.playerInfo.color;
    this.inputGameId.readOnly = true;
    this.aShareWhatsapp.hidden = true;
    this.aShareTelegram.hidden = true;
    this.aShareMail.hidden = true;
    this.gameConnection = new gameConnection();
    this.createID();
  },
  function() {
    //dest
    this.inputBack.removeEventListener('click', this.onButtonBack);
  });
createLayout.onButtonBack = function() {
  createLayout.gameConnection.disconnect();
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
  var shareMessage = encodeURI('Do you want to play octaball with me? Click ' + window.location.href);
  shareMessage = shareMessage.replace('#', '%23');
  createLayout.aShareWhatsapp.href = 'whatsapp://send?text=' + shareMessage;
  createLayout.aShareTelegram.href = "tg:msg?text=" + shareMessage;
  createLayout.aShareMail.href = 'mailto:?subject=Octaball&body=' + shareMessage;
  createLayout.aShareWhatsapp.hidden = false;
  createLayout.aShareTelegram.hidden = false;
  createLayout.aShareMail.hidden = false;
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
var connectLayout = new layout('connect', 'website/layout_connect.html', lytCtr, function(par) {
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
    connectLayout.inputGameId.readonly = true;
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
    connectLayout.inputGameId.readOnly = false;
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

var playingLayout = new layout('playing', 'website/layout_playing.html', lytCtr, function(par) {
  // init
  // html elements
  this.divGame = document.getElementById('div_game');
  this.inputBack = document.getElementById('input_back');
  this.inputAgain = document.getElementById('input_again');
  this.canvas = SVG("div_game")

  //site controls
  this.pageControls = par.pageControls;
  this.playerInfo = par.playerInfo;
  this.gameConnection = par.gameConnection;
  if (par.gameType) {
    this.gameType = par.gameType;
  } else {
    this.gameType = 'online';
  }

  //event listener
  this.inputBack.addEventListener('click', this.onButtonBack);
  window.addEventListener('resize', playingLayout.onResize);

  //variables
  this.touchStartPos = null;
  this.touchEndPos = null;

  this.alignment = 'horizontal';

  //initialize site
  playingLayout.inputAgain.hidden = true;
  this.pageControls.hideTitleFunc();
  this.resize();
  playingLayout.gameConnection.initializePlayer(playingLayout.playerInfo, playingLayout.initialized, playingLayout.redrawCanvas, playingLayout.shootResponse, playingLayout.onGameInterrupt, playingLayout.onGameInfo, this.gameType);
}, function() {
  //dest
  this.gameConnection.disconnect();
  this.pageControls.showTitleFunc();
  this.inputBack.removeEventListener('click', this.onButtonBack);
  window.removeEventListener('resize', playingLayout.onResize);
  this.removeGameControls();
});
playingLayout.resize = function() {
  var width = document.getElementById('div_parent').clientWidth;
  var height = document.getElementById('div_parent').clientHeight - 50;
  var h_width_hor = width / 13;
  var h_height_hor = height / 9;
  var h_width_ver = width / 9;
  var h_height_ver = height / 13;
  var h_hor = Math.min(h_width_hor, h_height_hor);
  var h_ver = Math.min(h_width_ver, h_height_ver);
  console.log(width)
  console.log(height);

  if (h_hor > h_ver) {
    //horizontal
    playingLayout.alignment = 'horizontal';
    playingLayout.divGame.style.height = h_hor * 9 + "px";
    playingLayout.canvas.height = h_hor * 9;
    playingLayout.divGame.style.width = h_hor * 13 + "px";
    playingLayout.canvas.width = h_hor * 13;
  } else {
    //vertical
    playingLayout.alignment = 'vertical';
    playingLayout.divGame.style.height = h_ver * 13 + "px";
    playingLayout.canvas.height = h_ver * 13;
    playingLayout.divGame.style.width = h_ver * 9 + "px";
    playingLayout.canvas.width = h_ver * 9;
  }
}
playingLayout.onButtonBack = function() {
  playingLayout.layoutController.changeLayout(mainLayout.name, {
    pageControls: playingLayout.pageControls,
    playerInfo: playingLayout.playerInfo
  });
}
playingLayout.initialized = function() {
  playingLayout.pageControls.updateStatusFunc('waiting for other player');
}
playingLayout.redrawCanvas = function(game) {
  playingLayout.currentGame = game;
  drawFieldtoCanvas(playingLayout.canvas, game, playingLayout.alignment);
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
    playingLayout.addGameControls();
    playingLayout.inputAgain.hidden = true;
  } else if (interrupt.msg == messages.gameInterrupt.rst.gameEnd) {
    if (interrupt.data == 'disconnect') {
      playingLayout.pageControls.updateStatusFunc('the game ended, because someone disconnected');
      playingLayout.removeGameControls();
      playingLayout.inputAgain.hidden = true;
    } else if (interrupt.data == 'winner') {
      playingLayout.pageControls.updateStatusFunc(interrupt.player.name + ' wins this game, congratulations!');
      playingLayout.removeGameControls();
      playingLayout.inputAgain.hidden = false;
      playingLayout.inputAgain.addEventListener('click', function() {
        playingLayout.gameConnection.again();
      })
    }
  }
}
playingLayout.addGameControls = function() {
  document.addEventListener('keypress', playingLayout.onKeyPress, false);
  playingLayout.divGame.addEventListener('touchstart', playingLayout.onTouchDown, false);
  playingLayout.divGame.addEventListener('touchmove', playingLayout.onTouchMove, false);
  playingLayout.divGame.addEventListener('touchend', playingLayout.onTouchUp, false);
}
playingLayout.removeGameControls = function() {
  document.removeEventListener('keypress', playingLayout.onKeyPress, false);
  playingLayout.divGame.removeEventListener('touchstart', playingLayout.onTouchDown, false);
  playingLayout.divGame.removeEventListener('touchmove', playingLayout.onTouchMove, false);
  playingLayout.divGame.removeEventListener('touchend', playingLayout.onTouchUp, false);
}
playingLayout.onGameInfo = function(info) {
  if (info.msg == messages.gameInfo.rst.again) {
    playingLayout.pageControls.updateStatusFunc(info.player + ' wants to play again');
  }
}
playingLayout.onKeyPress = function(event) {
  var direction = getDirectionfromKey(event.key, playingLayout.alignment);
  if (!playingLayout.gameConnection.shoot(direction)) {
    playingLayout.pageControls.updateStatusFunc('Waiting for server..');
  }
}
playingLayout.onTouchDown = function(event) {
  event.preventDefault();
  playingLayout.touchStartPos = {
    x: event.touches[0].pageX,
    y: event.touches[0].pageY
  };
}
playingLayout.onTouchMove = function(event) {
  event.preventDefault();
  playingLayout.touchEndPos = {
    x: event.touches[event.touches.length - 1].pageX,
    y: event.touches[event.touches.length - 1].pageY
  };
}
playingLayout.onTouchUp = function(event) {
  event.preventDefault();
  if (playingLayout.touchStartPos && playingLayout.touchEndPos) {
    var swipe = {
      x: playingLayout.touchEndPos.x - playingLayout.touchStartPos.x,
      y: playingLayout.touchEndPos.y - playingLayout.touchStartPos.y
    };
    if (Math.sqrt(swipe.x ** 2 + swipe.y ** 2) > 50) {
      var angle = Math.atan2(swipe.x, swipe.y);
      angle = angle + Math.PI;
      angle = angle / (2 * Math.PI);
      angle = angle * 8;
      angle = Math.round(angle);
      var directions = ['w', 'q', 'a', 'y', 'x', 'c', 'd', 'e', 'w'];
      if (!playingLayout.gameConnection.shoot(getDirectionfromKey(directions[angle], playingLayout.alignment))) {
        playingLayout.pageControls.updateStatusFunc('Waiting for server..');
      }
    }
  }
  playingLayout.touchStartPos = null;
}
playingLayout.onResize = function() {
  console.log('onresize');
  playingLayout.resize()
  if (playingLayout.currentGame) {
    playingLayout.redrawCanvas(playingLayout.currentGame);
  }
}

/** end layouts */

var divTitle = document.getElementById('div_title');
var divStatus = document.getElementById('div_status');
var divParent = document.getElementById('div_parent');
var divFooter = document.getElementById('div_footer');

function updateTitle(text) {
  divTitle.innerHTML = text;
}

function showTitle() {
  document.documentElement.style.setProperty('--title-height', '40px');
  document.documentElement.style.setProperty('--logo-height', '30px');
  divTitle.hidden = false;
  divFooter.hidden = false;
  window.dispatchEvent(new Event('resize'));
}

function hideTitle() {
  document.documentElement.style.setProperty('--title-height', '0px');
  document.documentElement.style.setProperty('--logo-height', '0px');
  divTitle.hidden = true;
  divFooter.hidden = true;
  window.dispatchEvent(new Event('resize'));
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

function drawFieldtoCanvas(canvas, game, alignment) {
  //canvas is svg
  canvas.clear();
  var h = 10;

  var background = {
    width: 1,
    color: "#A9D0F5"
  }
  if (alignment == "vertical") {
    for (var i = 0; i < 13; i++) {
      canvas.line(0 + "%", (100 / 13 * i + 100 / 26) + "%", 100 + "%", (100 / 13 * i + 100 / 26) + "%").stroke(background);
    }
    for (var i = 0; i < 9; i++) {
      canvas.line(100 / 9 * i + 100 / 18 + "%", 0 + "%", 100 / 9 * i + 100 / 18 + "%", 100 + "%").stroke(background);
    }
  } else {
    for (var i = 0; i < 9; i++) {
      canvas.line(0 + "%", (100 / 9 * i + 100 / 18) + "%", 100 + "%", (100 / 9 * i + 100 / 18) + "%").stroke(background);
    }
    for (var i = 0; i < 13; i++) {
      canvas.line(100 / 13 * i + 100 / 26 + "%", 0 + "%", 100 / 13 * i + 100 / 26 + "%", 100 + "%").stroke(background);
    }
  }
  //draw border
  noCorner = getPosition(11, 8, alignment, canvas)
  nwCorner = getPosition(1, 8, alignment, canvas)
  soCorner = getPosition(11, 0, alignment, canvas)
  swCorner = getPosition(1, 0, alignment, canvas)
  g1no = getPosition(1, 5, alignment, canvas)
  g1nw = getPosition(0, 5, alignment, canvas)
  g1so = getPosition(1, 3, alignment, canvas)
  g1sw = getPosition(0, 3, alignment, canvas)
  g2no = getPosition(12, 5, alignment, canvas)
  g2nw = getPosition(11, 5, alignment, canvas)
  g2so = getPosition(12, 3, alignment, canvas)
  g2sw = getPosition(11, 3, alignment, canvas)
  border = {
    width: 2,
    color: "#000000"
  }
  player1 = {
    width: 2,
    color: game.player.player0.color
  }
  player2 = {
    width: 2,
    color: game.player.player1.color
  }
  drawLine(nwCorner, noCorner, canvas, border)
  drawLine(swCorner, soCorner, canvas, border)
  drawLine(nwCorner, g1no, canvas, border)
  drawLine(swCorner, g1so, canvas, border)
  drawLine(noCorner, g2nw, canvas, border)
  drawLine(soCorner, g2sw, canvas, border)
  drawLine(g1no, g1nw, canvas, player1)
  drawLine(g1nw, g1sw, canvas, player1)
  drawLine(g1sw, g1so, canvas, player1)
  drawLine(g2nw, g2no, canvas, player2)
  drawLine(g2no, g2so, canvas, player2)
  drawLine(g2so, g2sw, canvas, player2)

  for (var i = 0; i < game.shoots.length - 1; i++) {
    var shoot = game.shoots[i];
    posA = getPosition(shoot.a.x, shoot.a.y, alignment, canvas)
    posB = getPosition(shoot.b.x, shoot.b.y, alignment, canvas)
    style = {
      width: 2,
      color: shoot.p
    }
    drawLine(posA, posB, canvas, style);
  }
  if (game.shoots.length > 0) {
    var shoot = game.shoots[game.shoots.length - 1]
    posA = getPosition(shoot.a.x, shoot.a.y, alignment, canvas)
    posB = getPosition(shoot.b.x, shoot.b.y, alignment, canvas)
    style = {
      width: 2,
      color: shoot.p
    }
    ballPos = getPosition(game.ball.x, game.ball.y, alignment, canvas);
    if (shoot.b.x == game.ball.x && shoot.b.y == game.ball.y) {
      drawLine(posA, posA, canvas, style).animate({
        ease: "<>",
        duration: 200
      }).attr({
        x2: posB.x,
        y2: posB.y
      });
      ball = canvas.polygon("1,0 0.707,0.707 0,1 -0.707,0.707 -1,0 -0.707,-0.707 0,-1 0.707,-0.707").size(15, 15).fill({
        color: "#000000"
      }).center(posA.x, posA.y).animate({
        ease: "<>",
        duration: 200
      }).center(ballPos.x, ballPos.y);
    } else {
      drawLine(posB, posB, canvas, style).animate({
        ease: "<>",
        duration: 200
      }).attr({
        x2: posA.x,
        y2: posA.y
      });
      ball = canvas.polygon("1,0 0.707,0.707 0,1 -0.707,0.707 -1,0 -0.707,-0.707 0,-1 0.707,-0.707").size(15, 15).fill({
        color: "#000000"
      }).center(posB.x, posB.y).animate({
        ease: "<>",
        duration: 200
      }).center(ballPos.x, ballPos.y);
    }
  } else {
    ballPos = getPosition(game.ball.x, game.ball.y, alignment, canvas);
    ball = canvas.polygon("1,0 0.707,0.707 0,1 -0.707,0.707 -1,0 -0.707,-0.707 0,-1 0.707,-0.707").size(15, 15).fill({
      color: "#000000"
    }).center(ballPos.x, ballPos.y);
  }
}

function drawLine(pointA, pointB, canvas, border) {
  return canvas.line(pointA.x, pointA.y, pointB.x, pointB.y).stroke(border);
}

function getPosition(i, j, alignment, canvas) {
  console.log(canvas.height)
  console.log(canvas.width);
  if (alignment == "vertical") {
    x = (1 / 9 * j + 1 / 18)*canvas.width
    y = (1-(1 / 13 * i + 1 / 26))*canvas.height
  } else {
    x = (1 / 13 * i + 1 / 26)*canvas.width
    y = (1 / 9 * j + 1 / 18)*canvas.height
  }
  return {
    x: x,
    y: y
  }
}


function drawFieldtoCanvas_OLD(canvas, game, alignment) {
  var context = canvas.getContext("2d");
  context.save();
  var width = canvas.width;
  var height = canvas.height;
  var h = 0;

  if (alignment == 'horizontal') {
    h = width / 13;
  } else {
    h = width / 9;
  }

  context.clearRect(0, 0, width, height);

  //quadrillpaper
  context.beginPath()
  if (alignment == 'vertical') {
    context.translate(width / 2, height / 2);
    context.rotate(-Math.PI / 2);
    context.translate(-height / 2, -width / 2);

  }
  for (var i = 0; i < 13; i++) {
    context.moveTo(i * h + h / 2, 0);
    context.lineTo(i * h + h / 2, Math.max(width, height));
  }
  for (var i = 0; i < 9; i++) {
    context.moveTo(0, i * h + h / 2);
    context.lineTo(Math.max(width, height), i * h + h / 2);
  }
  context.strokeStyle = '#A9D0F5';
  context.lineWidth = 1;
  context.stroke();

  //border
  context.beginPath();
  context.moveTo(1 * h + h / 2, 3 * h + h / 2);
  context.lineTo(1 * h + h / 2, 0 * h + h / 2);
  context.lineTo(11 * h + h / 2, 0 * h + h / 2);
  context.lineTo(11 * h + h / 2, 3 * h + h / 2);

  context.moveTo(11 * h + h / 2, 5 * h + h / 2);
  context.lineTo(11 * h + h / 2, 8 * h + h / 2);
  context.lineTo(1 * h + h / 2, 8 * h + h / 2);
  context.lineTo(1 * h + h / 2, 5 * h + h / 2);

  context.strokeStyle = '#000000';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(1 * h + h / 2, 3 * h + h / 2);
  context.lineTo(0 * h + h / 2, 3 * h + h / 2);
  context.lineTo(0 * h + h / 2, 5 * h + h / 2);
  context.lineTo(1 * h + h / 2, 5 * h + h / 2);

  context.strokeStyle = game.player.player0.color;
  context.stroke();

  context.beginPath();
  context.moveTo(11 * h + h / 2, 3 * h + h / 2);
  context.lineTo(12 * h + h / 2, 3 * h + h / 2);
  context.lineTo(12 * h + h / 2, 5 * h + h / 2);
  context.lineTo(11 * h + h / 2, 5 * h + h / 2);

  context.strokeStyle = game.player.player1.color;
  context.stroke();

  for (var i = 0; i < game.shoots.length; i++) {
    var shoot = game.shoots[i];
    var pointA = {
      x: shoot.a.x * h + h / 2,
      y: shoot.a.y * h + h / 2
    };
    var pointB = {
      x: shoot.b.x * h + h / 2,
      y: shoot.b.y * h + h / 2
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
  context.rect(game.ball.x * h + h / 2 - 5, game.ball.y * h + h / 2 - 5, 10, 10);
  context.stroke();

  context.strokeStyle = '#000000';
  context.restore();
}

function getDirectionfromKey(key, alignment) {
  var keyDict = {};
  if (alignment == 'horizontal') {
    keyDict = {
      q: 'G',
      w: 'F',
      e: 'E',
      d: 'D',
      c: 'C',
      x: 'B',
      y: 'A',
      a: 'H'
    };
  } else {
    keyDict = {
      q: 'E',
      w: 'D',
      e: 'C',
      d: 'B',
      c: 'A',
      x: 'H',
      y: 'G',
      a: 'F'
    };
  }
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
    updateHashFunc: updateHash,
    showTitleFunc: showTitle,
    hideTitleFunc: hideTitle
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
//
lytCtr.initializeLayout(welcomeLayout.name, par);
