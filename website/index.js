"use strict"
window.onerror = function(messageOrEvent, source, lineno, colno, error) {
  if (confirm('on snap!\nyou just found an error\ndo you want to send it to the developer?')) {
    let body = document.getElementById('body');
    body.innerHTML = 'open a new issue on <a href="http://www.github.com/tam724/octaball/issues">github</a> or send me an <a href="mailto:tamme-c@gmx.de?Subject=octaball error&Body=' + error.stack + '">email</a> (tamme-c@gmx.de): </br></br>'
    body.innerHTML += error.stack;
  }
  return false;
}
/** layouts */
// layout welcome
class WelcomeLayout extends Layout {
  constructor(lytCtr) {
    super('welcome', 'website/layout_welcome.html', lytCtr);
  }
  init(par) {
    // init
    // html elements
    this.inputName = document.getElementById('input_name');
    this.inputColor = document.getElementById('input_color');
    this.inputOkay = document.getElementById('input_okay');
    this.inputRemember = document.getElementById('input_remember');

    //site controls
    this.pageControls = par.pageControls;

    //event listener
    this.inputOkay.addEventListener('click', () => this.onButtonOkay());
    this.inputColor.addEventListener('change', () => this.onRangeColor());
    this.inputColor.addEventListener('input', () => this.onRangeColor());

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
  }
  dest() {}
  onButtonOkay() {
    if (this.inputName.value == '') {
      this.pageControls.updateStatusFunc('insert a name');
    } else if (!this.color) {
      this.pageControls.updateStatusFunc('choose a color');
    } else {
      if (this.inputRemember.checked) {
        localStorage.setItem('name', this.inputName.value);
        localStorage.setItem('color', this.color);
      } else {
        localStorage.removeItem('name');
        localStorage.removeItem('color');
      }
      if (this.gameID) {
        this.layoutController.changeLayout(connectLayout.name, {
          pageControls: this.pageControls,
          playerInfo: {
            name: this.inputName.value,
            color: this.color
          },
          gameID: this.gameID
        });
      } else {
        this.layoutController.changeLayout(mainLayout.name, {
          pageControls: this.pageControls,
          playerInfo: {
            name: this.inputName.value,
            color: this.color
          }
        });
      }
    }
  }
  onRangeColor() {
    let value = this.inputColor.value;
    this.color = getColorfromDouble(value);
    this.inputName.style.backgroundColor = this.color;
  }
}
// layout main
class MainLayout extends Layout {
  constructor(lytCtr) {
    super('main', 'website/layout_main.html', lytCtr);
  }
  init(par) {
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
    this.inputCreate.addEventListener('click', () => this.onButtonCreate());
    this.inputConnect.addEventListener('click', () => this.onButtonConnect());
    this.inputChangeName.addEventListener('click', () => this.onButtonChangeName());
    this.inputSingleplayer.addEventListener('click', () => this.onButtonSingleplayer());

    //variables

    //initialize site
    this.pageControls.updateTitleFunc('octaball');
    this.pageControls.updateStatusFunc('hi ' + this.playerInfo.name);

    this.pageControls.updateHashFunc('');
  }
  dest() {}
  onButtonCreate() {
    this.layoutController.changeLayout(createLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo
    });
  }
  onButtonConnect() {
    this.layoutController.changeLayout(connectLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo
    });
  }
  onButtonChangeName() {
    this.layoutController.changeLayout(welcomeLayout.name, {
      pageControls: this.pageControls
    });
  }
  onButtonSingleplayer() {
    this.layoutController.changeLayout(playingLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo,
      gameType: 'offlineSingle',
      gameConnection: new OfflineSingleGameConnection()
    })
  }
}
// layout create
class CreateLayout extends Layout {
  constructor(lytCtr) {
    super('create', 'website/layout_create.html', lytCtr);
  }
  init(par) {
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
    this.inputBack.addEventListener('click', () => this.onButtonBack());
    //variables

    //initialize site
    this.pageControls.updateStatusFunc('creating a new game for you..');
    this.divLoader.style.borderTopColor = this.playerInfo.color;
    this.inputGameId.readOnly = true;
    this.aShareWhatsapp.hidden = true;
    this.aShareTelegram.hidden = true;
    this.aShareMail.hidden = true;
    this.gameConnection = new OnlineGameConnection();
    this.createID();
  }
  dest() {}
  onButtonBack() {
    this.gameConnection.disconnect();
    this.layoutController.changeLayout(mainLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo
    });
  }
  createID() {
    this.gameConnection.createID((gameID) => this.onIDCreated(gameID));
  }
  onIDCreated(gameID) {
    this.gameConnection.connectToRoom(gameID, () => this.onConnectedToRoom(), () => this.onRoomConnected());
  }
  onConnectedToRoom() {
    //this.layoutController.changeLayout()
    this.inputGameId.value = this.gameConnection.gameID;
    this.pageControls.updateHashFunc(this.gameConnection.gameID);
    this.divLoader.hidden = true;
    let shareMessage = encodeURI('Do you want to play octaball with me? Click ' + window.location.href);
    shareMessage = shareMessage.replace('#', '%23');
    this.aShareWhatsapp.href = 'whatsapp://send?text=' + shareMessage;
    this.aShareTelegram.href = "tg:msg?text=" + shareMessage;
    this.aShareMail.href = 'mailto:?subject=Octaball&body=' + shareMessage;
    this.aShareWhatsapp.hidden = false;
    this.aShareTelegram.hidden = false;
    this.aShareMail.hidden = false;
    this.pageControls.updateStatusFunc('share this gameID with your friend');
  }
  onRoomConnected() {
    //called when the room is filled with 2 people
    this.layoutController.changeLayout(playingLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo,
      gameConnection: this.gameConnection
    });
  }
}
// layout connect
class ConnectLayout extends Layout {
  constructor(lytCtr) {
    super('connect', 'website/layout_connect.html', lytCtr);
  }

  init(par) {
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
    this.inputBack.addEventListener('click', () => this.onButtonBack());
    this.inputConnect.addEventListener('click', () => this.onButtonConnect());

    //variables

    //initialize site
    this.pageControls.updateStatusFunc('type a game id');
    this.divLoader.style.borderTopColor = this.playerInfo.color;

    this.gameConnection = new OnlineGameConnection();
    if (par.gameID) {
      this.inputGameId.value = par.gameID;
      this.onButtonConnect();
    }
  }
  dest() {}
  onButtonBack() {
    this.layoutController.changeLayout(mainLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo
    });
  }
  onButtonConnect() {
    let gameID = this.inputGameId.value;
    if (gameID && gameID != '' && gameID.length == 5) {
      this.inputGameId.readonly = true;
      this.divLoader.hidden = false;
      this.gameConnection.checkID(gameID, (res) => this.onCheckResult(res));
    } else {
      this.pageControls.updateStatusFunc('input a game id');
    }
  }
  onCheckResult(result) {
    if (result == messages.checkID.rst.ok) {
      this.divLoader.hidden = true;
      this.pageControls.updateStatusFunc('connecting to game');
      this.gameConnection.connectToRoom(this.inputGameId.value, () => this.onConnectedToRoom(), () => this.onRoomConnected());
    } else if (result == messages.checkID.rst.error) {
      this.inputGameId.readOnly = false;
      this.divLoader.hidden = true;
      this.pageControls.updateStatusFunc('this id does not exist');
    }
  }
  onConnectedToRoom() {
    this.pageControls.updateStatusFunc('connected');
    this.pageControls.updateHashFunc(this.gameConnection.gameID);
  }
  onRoomConnected() {
    //called when the room is filled with 2 people
    this.layoutController.changeLayout(playingLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo,
      gameConnection: this.gameConnection
    })
  }
}
// layout playing
class PlayingLayout extends Layout {
  constructor(lytCtr) {
    super('playing', 'website/layout_playing.html', lytCtr);
  }
  init(par) {
    // html elements
    this.divGame = document.getElementById('div_game');
    this.inputBack = document.getElementById('input_back');
    this.inputAgain = document.getElementById('input_again');
    this.canvas = SVG("div_game");
    this.canvas.viewbox(0, 0, 130, 90);


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
    this.inputBack.addEventListener('click', () => this.onButtonBack());
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    this.divGame.addEventListener('touchstart', (e) => this.onTouchDown(e), false);
    this.divGame.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
    this.divGame.addEventListener('touchend', (e) => this.onTouchUp(e), false);

    //variables
    this.touchStartPos = null;
    this.touchEndPos = null;

    this.alignment = 'horizontal';
    this.graphicsElements = {};

    this.gameControlsEnabled = false;

    //initialize site
    this.inputAgain.hidden = true;
    this.pageControls.hideTitleFunc();
    this.onResize();
    this.gameConnection.initializePlayer(this.playerInfo, () => this.initialized(), (game) => this.redrawCanvas(game, false, true), (resp) => this.shootResponse(resp), (interr) => this.onGameInterrupt(interr), (info) => this.onGameInfo(info));
  }
  dest() {
    this.gameConnection.disconnect();
    this.pageControls.showTitleFunc();
    this.disableGameControls();
  }
  onButtonBack() {
    this.layoutController.changeLayout(mainLayout.name, {
      pageControls: this.pageControls,
      playerInfo: this.playerInfo
    });
  }
  initialized() {
    this.pageControls.updateStatusFunc('waiting for other player');
  }
  redrawCanvas(game, updateBackgroud, animate) {
    this.currentGame = game;
    drawFieldtoCanvas(this.canvas, game, this.graphicsElements, animate);
    if (game.activeplayer.name == this.playerInfo.name) {
      this.pageControls.updateStatusFunc('it\'s your turn');
    } else {
      this.pageControls.updateStatusFunc('it is ' + game.activeplayer.name + '\'s turn');
    }
  }
  shootResponse(response) {
    if (response == messages.shoot.rst.ok) {
      //well done
    } else if (response == messages.shoot.rst.gameWon) {
      console.log(messages.shoot.rst.gameWon);
    } else if (response == messages.shoot.rst.notYourTurn) {
      this.pageControls.updateStatusFunc('it\'s not your turn');
    } else if (response == messages.shoot.rst.occupied) {
      this.pageControls.updateStatusFunc('shoot already occupied');
    } else if (response == messages.shoot.rst.border) {
      this.pageControls.updateStatusFunc('shoot over border');
    }
  }
  onGameInterrupt(interrupt) {
    if (interrupt.msg == messages.gameInterrupt.rst.gameStart) {
      this.enableGameControls();
      this.canvas.clear();
      drawBackgroundtoCanvas(this.canvas, this.graphicsElements);
      this.graphicsElements.ball = drawBall(getPosition(6, 4), this.canvas, '#000000');
      this.inputAgain.hidden = true;
    } else if (interrupt.msg == messages.gameInterrupt.rst.gameEnd) {
      if (interrupt.data == 'disconnect') {
        this.pageControls.updateStatusFunc('the game ended, because someone disconnected');
        this.disableGameControls();
        this.inputAgain.hidden = true;
      } else if (interrupt.data == 'winner') {
        this.pageControls.updateStatusFunc(interrupt.player.name + ' wins this game, congratulations!');
        this.disableGameControls();
        this.inputAgain.hidden = false;
        this.inputAgain.addEventListener('click', () => this.gameConnection.again())
      }
    }
  }
  enableGameControls(){
    this.gameControlsEnabled = true;
  }
  disableGameControls() {
    this.gameControlsEnabled = false;
  }
  onGameInfo(info) {
    if (info.msg == messages.gameInfo.rst.again) {
      this.pageControls.updateStatusFunc(info.player + ' wants to play again');
    }
  }
  onKeyUp(event) {
    if (!this.gameControlsEnabled) return;
    let direction = getDirectionfromKey(event.key, this.alignment);
    if (!this.gameConnection.shoot(direction)) {
      this.pageControls.updateStatusFunc('Waiting for server..');
    }
  }
  onTouchDown(event) {
    event.preventDefault();
    if (!this.gameControlsEnabled) return;
    this.touchStartPos = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    };
  }
  onTouchMove(event) {
    event.preventDefault();
    if (!this.gameControlsEnabled) return;
    this.touchEndPos = {
      x: event.touches[event.touches.length - 1].pageX,
      y: event.touches[event.touches.length - 1].pageY
    };
  }
  onTouchUp(event) {
    event.preventDefault();
    if (!this.gameControlsEnabled) return;
    if (this.touchStartPos && this.touchEndPos) {
      let swipe = {
        x: this.touchEndPos.x - this.touchStartPos.x,
        y: this.touchEndPos.y - this.touchStartPos.y
      };
      if (Math.sqrt(swipe.x ** 2 + swipe.y ** 2) > 50) {
        let angle = Math.atan2(swipe.x, swipe.y);
        angle = angle + Math.PI;
        angle = angle / (2 * Math.PI);
        angle = angle * 8;
        angle = Math.round(angle);
        let directions = ['w', 'q', 'a', 'y', 'x', 'c', 'd', 'e', 'w'];
        if (!this.gameConnection.shoot(getDirectionfromKey(directions[angle], this.alignment))) {
          this.pageControls.updateStatusFunc('Waiting for server..');
        }
      }
    }
    this.touchStartPos = null;
  }
  onResize() {
    let width = document.getElementById('div_parent').clientWidth - 5;
    let height = document.getElementById('div_parent').clientHeight - 55;
    let h_hor = Math.min(width / 13, height / 9);
    let h_ver = Math.min(width / 9, height / 13);
    this.divGame.style.width = width;
    this.divGame.style.height = height;
    this.canvas.size(width, height);
    if (h_hor > h_ver) {
      this.alignment = 'horizontal';
      this.canvas.rotate(0, 0, 0);
      this.canvas.scale(1, 0, 0);
    } else {
      this.alignment = 'vertical';
      this.canvas.rotate(-90, 0, 0);
      this.canvas.scale(h_ver / (10 * this.canvas.viewbox().zoom), 0, 0)
    }
  }
}
/** end layouts */

let divTitle = document.getElementById('div_title');
let divStatus = document.getElementById('div_status');
let divParent = document.getElementById('div_parent');
let divFooter = document.getElementById('div_footer');

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
  let step = 100 / 3;
  let r, g, b;
  let max = 150;
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
  let mycolor = "#" + toHex(r) + toHex(g) + toHex(b);
  return mycolor;
}

function toHex(value) {
  let hex = (value).toString(16);
  while (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex;
}

function drawBackgroundtoCanvas(canvas, graphicsElements) {
  let background = {
    width: 0.2,
    color: "#A9D0F5"
  }
  let delay = 0;
  for (let i = 0; i < 9; i++) {
    canvas.line(0, 10 * i + 5, 0, 10 * i + 5).stroke(background).animate({
      ease: "<>",
      duration: 500,
      delay: delay
    }).plot(0, 10 * i + 5, 130, 10 * i + 5);
    delay += 100;
  }
  delay = 0;
  for (let i = 0; i < 13; i++) {
    canvas.line(10 * i + 5, 0, 10 * i + 5, 0).stroke(background).animate({
      ease: "<>",
      duration: 500,
      delay: delay
    }).plot(10 * i + 5, 0, 10 * i + 5, 90);
    delay += 100;
  }
  //draw border
  let noCorner = getPosition(11, 8)
  let nwCorner = getPosition(1, 8)
  let soCorner = getPosition(11, 0)
  let swCorner = getPosition(1, 0)
  let g1no = getPosition(1, 5)
  let g1nw = getPosition(0, 5)
  let g1so = getPosition(1, 3)
  let g1sw = getPosition(0, 3)
  let g2no = getPosition(12, 5)
  let g2nw = getPosition(11, 5)
  let g2so = getPosition(12, 3)
  let g2sw = getPosition(11, 3)
  let border = {
    width: 0.3,
    color: "#000000"
  }
  canvas.polyline([g1no, nwCorner, noCorner, g2nw]).fill('none').stroke(border);
  canvas.polyline([g1so, swCorner, soCorner, g2sw]).fill('none').stroke(border);
  graphicsElements.goalPlayer0 = canvas.polyline([g1no, g1nw, g1sw, g1so]).fill('none').stroke(border);
  graphicsElements.goalPlayer1 = canvas.polyline([g2nw, g2no, g2so, g2sw]).fill('none').stroke(border);
}

function drawFieldtoCanvas(canvas, game, graphicsElements, animate) {
  if (game.shoots.length > 0 && animate) {
    let shoot = game.shoots[game.shoots.length - 1]
    let posA = getPosition(shoot.a.x, shoot.a.y)
    let posB = getPosition(shoot.b.x, shoot.b.y)
    let style = {
      width: 0.3,
      color: shoot.p
    }
    if (shoot.b.x == game.ball.x && shoot.b.y == game.ball.y) {
      drawAnimatedLine(posA, posB, canvas, style);
    } else {
      drawAnimatedLine(posB, posA, canvas, style);
    }
    animateBall(graphicsElements.ball, getPosition(game.ball.x, game.ball.y));
  }
  colorBall(graphicsElements.ball, game.activeplayer.color);
  graphicsElements.goalPlayer0.attr({
    stroke: game.player.player0.color
  });
  graphicsElements.goalPlayer1.attr({
    stroke: game.player.player1.color
  });
}

function animateBall(ball, point) {
  ball.animate({
    ease: "<>",
    duration: 200
  }).center(point[0], point[1]);
}

function colorBall(ball, color) {
  ball.fill({
    color: color
  });
}

function drawBall(point, canvas, color) {
  return canvas.polygon("1,0 0.707,0.707 0,1 -0.707,0.707 -1,0 -0.707,-0.707 0,-1 0.707,-0.707 1,0").size(2, 2).fill({
    color: color
  }).center(point[0], point[1]);
}

function drawAnimatedLine(pointA, pointB, canvas, border) {
  return drawLine(pointA, pointA, canvas, border).animate({
    ease: "<>",
    duration: 200
  }).attr({
    x2: pointB[0],
    y2: pointB[1]
  });
}

function drawLine(pointA, pointB, canvas, border) {
  return canvas.line(pointA[0], pointA[1], pointB[0], pointB[1]).stroke(border);
}

function getPosition(i, j) {
  return [10 * i + 5, 10 * j + 5];
}

function getDirectionfromKey(key, alignment) {
  let keyDict = {};
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
let layoutContr = new LayoutController('div_parent');
let welcomeLayout = new WelcomeLayout(layoutContr);
let mainLayout = new MainLayout(layoutContr);
let createLayout = new CreateLayout(layoutContr);
let connectLayout = new ConnectLayout(layoutContr);
let playingLayout = new PlayingLayout(layoutContr);

layoutContr.registerLayout(welcomeLayout);
layoutContr.registerLayout(mainLayout);
layoutContr.registerLayout(createLayout);
layoutContr.registerLayout(connectLayout);
layoutContr.registerLayout(playingLayout);

let par = {
  pageControls: {
    updateTitleFunc: updateTitle,
    updateStatusFunc: updateStatus,
    updateHashFunc: updateHash,
    showTitleFunc: showTitle,
    hideTitleFunc: hideTitle
  },
};
if (window.location.hash != '') {
  let gameID = window.location.hash.substring(1, window.location.hash.length);
  par.gameID = gameID;
}
if (localStorage.getItem('name') != null && localStorage.getItem('color') != null) {
  par.playerInfo = {
    name: localStorage.getItem('name'),
    color: localStorage.getItem('color')
  }
}
//
layoutContr.initializeLayout(welcomeLayout.name, par);
