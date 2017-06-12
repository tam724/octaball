class Point {
  /** constructs a point */
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
  validShoots() {
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
  occupiedShoots() {
    var allDirections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var occupiedShoots = [];
    for (var i = 0; i < allDirections.length; i++) {
      if (this[allDirections[i]] != null && this[allDirections[i]].player != null) {
        occupiedShoots.push(this[allDirections[i]]);
      }
    }
    return occupiedShoots;
  }

  /** draws the shoot on a canvas */
  draw(context, width, height) {
    //must later depend on the orientation
    var [drawLocX, drawLocY] = this.drawLocation(context, width, height);
    context.strokeRect(drawLocX - 3, drawLocY - 3, 6, 6);
  }

  /** returns the location to draw the point on the canvas */
  drawLocation(context, width, height) {
    var shootWidth = width/13;
    var shootHeight = height/9;
    return [this.x * shootWidth + shootWidth/2, this.y * shootHeight + shootHeight/2];
  }
}
