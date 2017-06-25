if (typeof module !== 'undefined') {
  var Point = require('./point');
  var Shoot = require('./shoot');
  var Ball = require('./ball');
  var Player = require('./player');
}

function Game(player0, player1) {
  /** initializes the points */
  this.initPoints = function() {
    var points = [];
    for (var i = 0; i < 13; i++) {
      points[i] = [];
      for (var j = 0; j < 9; j++) {
        points[i].push(new Point(i, j));
      }
    }
    return points;
  }

  /** initializes the shoots */
  this.initShoots = function() {
    var shoots = []
    for (var i = 0; i < 13; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.points[i - 1] != null && this.points[i - 1][j + 1] != null) {
          if (!((i == 1 && j < 3) || (i == 1 && j > 4) || (i == 12 && j < 3) || (i == 12 && j > 4))) {
            var shoot = new Shoot(this.points[i][j], this.points[i - 1][j + 1]);
            this.points[i][j].A = shoot;
            this.points[i - 1][j + 1].E = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i] != null && this.points[i][j + 1] != null) {
          if (!((i == 0) || (i == 12) || (i == 1 && j < 3) || (i == 1 && j > 4) || (i == 11 && j < 3) || (i == 11 && j > 4))) {
            var shoot = new Shoot(this.points[i][j], this.points[i][j + 1]);
            this.points[i][j].B = shoot;
            this.points[i][j + 1].F = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i + 1] != null && this.points[i + 1][j + 1] != null) {
          if (!((i == 0 && j < 3) || (i == 0 && j > 4) || (i == 11 && j < 3) || (i == 11 && j > 4))) {
            var shoot = new Shoot(this.points[i][j], this.points[i + 1][j + 1]);
            this.points[i][j].C = shoot;
            this.points[i + 1][j + 1].G = shoot;
            shoots.push(shoot);
          }
        }
        if (this.points[i + 1] != null && this.points[i + 1][j] != null) {
          if (!((j == 0) || (j == 8) || (i == 0 && j < 4) || (i == 0 && j > 4) || (i == 11 && j < 4) || (i == 11 && j > 4))) {
            var shoot = new Shoot(this.points[i][j], this.points[i + 1][j]);
            this.points[i][j].D = shoot;
            this.points[i + 1][j].H = shoot;
            shoots.push(shoot);
          }
        }
      }
    }
    return shoots;
  }

  this.getOtherPlayer = function(player) {
    if (player == this.player0) {
      return this.player1;
    } else if (player == this.player1) {
      return this.player0;
    }
  }

  this.isValidShoot = function(direction) {
    if (this.ball.point[direction] != null) {
      if (this.ball.point[direction].player == null) {
        return {
          msg: 'OK'
        };
      } else {
        return {
          msg: 'ShootOccupied',
          p: this.ball.point[direction].player.name
        };
      }
    } else {
      return {
        msg: 'Border'
      };
    }
  }

  this.tryShoot = function(direction, player) {
    if (this.winner) {
      return {
        msg: 'GameWon',
        p: this.winner.name
      };
    }
    if (this.activeplayer != player) {
      return {
        msg: 'NotYourTurn',
        p: this.activeplayer.name
      };
    }
    var shootResult = this.isValidShoot(direction);
    if (shootResult.msg != 'OK') {
      return shootResult;
    }

    if (this.activeplayer == player && shootResult.msg == 'OK' && !this.winner) {
      // actual shooting
      this.ball.point[direction].player = player;
      this.ball.point = this.ball.point[direction].getOtherPoint(this.ball.point);
      //check for winner
      this.testWinner();
      if (this.ball.point.occupiedShoots().length == 1 && this.ball.point.validDirections().length == 8) {
        //player change if the active player is the first at a specific point (occupied == 1) and it is not the border (valid == 8)
        this.activeplayer = this.getOtherPlayer(this.activeplayer);
      }
    }
    return {
      msg: 'OK',
      p: this.activeplayer.name
    };
  }

  this.testWinner = function() {
    if (this.ball.point.x == 0) {
      this.winner = this.player1;
      return true;
    } else if (this.ball.point.x == 12) {
      this.winner = this.player0;
      return true;
    } else if (this.ball.point.validShoots().length == this.ball.point.occupiedShoots().length) {
      this.winner = this.getOtherPlayer(this.activeplayer);
      return true;
    }
    return false;
  }

  this.getActivePlayer = function() {
    return this.activeplayer;
  }

  this.getWinner = function() {
    return this.winner;
  }

  this.getForSending = function() {
    var pkg = {
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
    for (var i = 0; i < this.shoots.length; i++) {
      if (this.shoots[i].player) {
        pkg.shoots.push({
          a: {
            x: this.shoots[i].a.x,
            y: this.shoots[i].a.y
          },
          b: {
            x: this.shoots[i].b.x,
            y: this.shoots[i].b.y
          },
          p: this.shoots[i].player.color
        });
      }
    }
    return pkg;
  }

  this.player0 = player0;
  this.player1 = player1;
  this.activeplayer = player0;
  this.points = this.initPoints();
  this.shoots = this.initShoots();
  this.ball = new Ball(this.points[6][4]);
}

if (typeof module !== 'undefined') {
  module.exports = Game;
}
