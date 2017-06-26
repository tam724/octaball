function Point(x, y) {
  /** returns if the ball is on this point */
  this.hasBall = function(game) {
    return (game.ball.point == this);
  }

  /** returns all directions a player can shoot from this point, including already occupied ones */
  this.validDirections = function() {
    // a directory is valid if it is on the field
    var allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var validDirections = [];
    for (var i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null) {
        validDirections.push(allDirections[i]);
      }
    }
    return validDirections;
  }

  /** returns all shoots a player can shoot from this point, including already occupied ones */
  this.validShoots = function() {
    var allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var validShoots = [];
    for (var i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null) {
        validShoots.push(this[allDirections[i]]);
      }
    }
    return validShoots;
  }

  /** returns all shoots a player can shoot from this point, excluding already occupied ones */
  this.occupiedShoots = function() {
    var allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var occupiedShoots = [];
    for (var i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null && this[allDirections[i]].player != null) {
        occupiedShoots.push(this[allDirections[i]]);
      }
    }
    return occupiedShoots;
  }

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

if (typeof module !== 'undefined') {
  module.exports = Point;
}
