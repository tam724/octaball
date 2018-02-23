"use strict"
class Game {
  constructor(player0, player1, startplayer) {
    this.player0 = player0;
    this.player1 = player1;
    if (startplayer) {
      this.activeplayer = startplayer;
    } else {
      this.activeplayer = Math.random() < 0.5 ? player0 : player1;
    }
    this.points = this.initPoints();
    this.shoots = this.initShoots();
    this.occpShoots = []
    this.ball = new Ball(this.points[6][4]);
  }
  /** initializes the points */
  initPoints() {
    let points = [];
    for (let i = 0; i < 13; i++) {
      points[i] = [];
      for (let j = 0; j < 9; j++) {
        points[i].push(new Point(i, j));
      }
    }
    return points;
  }

  /** initializes the shoots */
  initShoots() {
    let shoots = []
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.points[i - 1] != null && this.points[i - 1][j + 1] != null) {
          if (!((i == 1 && j < 3) || (i == 1 && j > 4) || (i == 12 && j < 3) || (i == 12 && j > 4))) {
            let shoot = new Shoot(this.points[i][j], this.points[i - 1][j + 1]);
            this.points[i][j].A = shoot;
            this.points[i - 1][j + 1].E = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i] != null && this.points[i][j + 1] != null) {
          if (!((i == 0) || (i == 12) || (i == 1 && j < 3) || (i == 1 && j > 4) || (i == 11 && j < 3) || (i == 11 && j > 4))) {
            let shoot = new Shoot(this.points[i][j], this.points[i][j + 1]);
            this.points[i][j].B = shoot;
            this.points[i][j + 1].F = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i + 1] != null && this.points[i + 1][j + 1] != null) {
          if (!((i == 0 && j < 3) || (i == 0 && j > 4) || (i == 11 && j < 3) || (i == 11 && j > 4))) {
            let shoot = new Shoot(this.points[i][j], this.points[i + 1][j + 1]);
            this.points[i][j].C = shoot;
            this.points[i + 1][j + 1].G = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i + 1] != null && this.points[i + 1][j] != null) {
          if (!((j == 0) || (j == 8) || (i == 0 && j < 4) || (i == 0 && j > 4) || (i == 11 && j < 4) || (i == 11 && j > 4))) {
            let shoot = new Shoot(this.points[i][j], this.points[i + 1][j]);
            this.points[i][j].D = shoot;
            this.points[i + 1][j].H = shoot;
            shoots.push(shoot);
          }
        }
      }
    }
    return shoots;
  }

  getOtherPlayer(player) {
    if (player == this.player0) {
      return this.player1;
    } else if (player == this.player1) {
      return this.player0;
    }
  }

  isValidShoot(direction, player) {
    if (this.ball.point[direction] == null){ //there is no shoot
      return false;
    }
    if (this.ball.point[direction].player != null) { //shoot is already occupied
      return false;
    }
    if (this.getWinner()) { //game is already won
      return false;
    }
    if (this.activeplayer != player){ //it is not the players turn
      return false;
    }
    return true;
  }

  tryShoot(direction, player) {
    let valid = this.isValidShoot(direction, player);
    if(valid){
      // actual shooting
      this.ball.point[direction].player = player;
      this.occpShoots.push(this.ball.point[direction]);
      this.ball.point = this.ball.point[direction].getOtherPoint(this.ball.point);
      //check for winner
      if (this.ball.point.occupiedShoots().length == 1 && this.ball.point.validDirections().length == 8) {
        //player change if the active player is the first at a specific point (occupied == 1) and it is not the border (valid == 8)
        this.activeplayer = this.getOtherPlayer(this.activeplayer);
      }
    }
    return valid
  }

  getWinner() {
    if (this.ball.point.x == 0) {
      return this.player1;
    } else if (this.ball.point.x == 12) {
      return this.player0;
    } else if (this.ball.point.validShoots().length == this.ball.point.occupiedShoots().length) {
      return this.getOtherPlayer(this.activeplayer);
    }
  }

  getActivePlayer() {
    return this.activeplayer;
  }

  getForSending() {
    let pkg = {
      shoots: [],
      ball: {
        x: this.ball.point.x,
        y: this.ball.point.y
      },
      player: {
        player0: this.player0,
        player1: this.player1
      },
      activeplayer: this.activeplayer
    };
    for (let i = 0; i < this.occpShoots.length; i++) {
      pkg.shoots.push({
        a: {
          x: this.occpShoots[i].a.x,
          y: this.occpShoots[i].a.y
        },
        b: {
          x: this.occpShoots[i].b.x,
          y: this.occpShoots[i].b.y
        },
        p: this.occpShoots[i].player.color
      });
    }
    return pkg;
  }
}

class GameAI {
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.directions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    this.directionScore = {
      A: 1,
      B: 0,
      C: -1,
      D: -1,
      E: -1,
      F: 0,
      G: 1,
      H: 1
    };
    this.shoots = [];
    this.currentScore = -1000;
  }


  computeShoot() {
    let point = this.game.ball.point;
    this.searchRecursive(this.player, point, [], this.onShootFound);
    let currentShoot = this.shoots[Math.floor(Math.random() * this.shoots.length)];
    return currentShoot;
  }

  onShootFound(shoot, endPoint, allOccupied) {
    let score = 0;
    if (endPoint.x == 0) {
      score = 100;
    } else if (endPoint.x == 12) {
      score = -100;
    } else if (allOccupied) {
      score = -200;
    } else {
      for (let j = 0; j < shoot.length; j++) {
        score += this.directionScore[shoot[j]];
      }
      this.opponentScore = -1000;
      this.searchRecursive(this.game.getOtherPlayer(this.player), endPoint, [], this.onOpponentShootFound);
      score = score - this.opponentScore;
    }
    if (this.currentScore < score) {
      this.shoots = [];
      this.shoots.push(shoot);
      this.currentScore = score;
    } else if (this.currentScore == score) {
      this.shoots.push(shoot);
    }
  }

  onOpponentShootFound(shoot, endPoint, allOccupied) {
    let score = 0;
    if (endPoint.x == 0) {
      score = -50;
    } else if (endPoint.x == 12) {
      score = 50;
    } else {
      for (let j = 0; j < shoot.length; j++) {
        score -= this.directionScore[shoot[j]];
      }
    }
    if (this.opponentScore < score) {
      this.opponentScore = score;
    }
  }

  searchRecursive(player, point, shoot, onShootFound) {
    for (let i = 0; i < 8; i++) {
      if (point[this.directions[i]] != null && point[this.directions[i]].player == null) {
        //if shoot exists and is not already occupied
        if (point[this.directions[i]].AItry == null) {
          //if shoot is not already occupied by this AItry
          point[this.directions[i]].AItry = player; //do the shoot
          let nextShoot = shoot.slice();
          nextShoot.push(this.directions[i]); //add shoot
          let nextPoint = point[this.directions[i]].getOtherPoint(point);
          let AItries = 0;
          for (let j = 0; j < 8; j++) {
            if (nextPoint[this.directions[j]] != null && nextPoint[this.directions[j]].AItry != null) AItries++;
          }
          let allOccupied = nextPoint.validShoots().length == (nextPoint.occupiedShoots().length + AItries);
          if ((nextPoint.occupiedShoots().length == 0 && nextPoint.validDirections().length == 8) || nextPoint.x == 0 || nextPoint.x == 12 || allOccupied) {
            onShootFound.call(this, nextShoot, nextPoint, allOccupied);
          } else {
            //again
            this.searchRecursive(player, nextPoint, nextShoot, onShootFound);
          }
          point[this.directions[i]].AItry = null;
        }
      }
    }
  }
}

class Point {
  constructor(x, y) {
    //position on field
    this.x = x;
    this.y = y;
    //shoots in all directions, assigned by game.initShoots()
    this.A = null;
    this.B = null;
    this.C = null;
    this.D = null;
    this.E = null;
    this.F = null;
    this.G = null;
    this.H = null;
  }

  /** returns if the ball is on this point */
  hasBall(game) {
    return (game.ball.point == this);
  }

  /** returns all directions a player can shoot from this point, including already occupied ones */
  validDirections() {
    // a directory is valid if it is on the field
    let allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let validDirections = [];
    for (let i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null) {
        validDirections.push(allDirections[i]);
      }
    }
    return validDirections;
  }

  /** returns all shoots a player can shoot from this point, including already occupied ones */
  validShoots() {
    let allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let validShoots = [];
    for (let i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null) {
        validShoots.push(this[allDirections[i]]);
      }
    }
    return validShoots;
  }

  /** returns all shoots a player can shoot from this point, excluding already occupied ones */
  occupiedShoots() {
    let allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let occupiedShoots = [];
    for (let i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null && this[allDirections[i]].player != null) {
        occupiedShoots.push(this[allDirections[i]]);
      }
    }
    return occupiedShoots;
  }
}

class Shoot {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.player = null;
  }

  /** returns the other point */
  getOtherPoint(point) {
    if (this.a == point) {
      return this.b;
    } else if (this.b == point) {
      return this.a;
    } else {
      throw "Point not included in shoot";
    }
  }
}

class Player {
  constructor(name, color) {
    this.color = color;
    this.name = name;
    this.again = false;
  }
}

class Ball {
  constructor(point) {
    this.point = point;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    Game: Game,
    GameAI: GameAI,
    Point: Point,
    Shoot: Shoot,
    Player: Player,
    Ball: Ball
  }
}
