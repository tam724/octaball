class Point {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  hasBall(game){
    return (game.ball.x == this.x && game.ball.y == this.x)
  }

  validDirections(){
    // a directory is valid if it is on the field
    var allDirections = ['A','B','C','D','E','F','G','H'];
    var validDirections = [];
    for(var i = 0; i < allDirections.length; i++){
      if(this[allDirections[i]] != null){
        validDirections.push(allDirections[i]);
      }
    }
    return validDirections;
  }

  validShoots(){
    var validDirections = this.validDirections();
    var validShoots = [];
    for(var i = 0; i < validDirections.length; i++){
      validShoots.push(this[validDirections[i]]);
    }
    return validShoots;
  }

  occupiedShoots(){
    var allDirections = ['A','B','C','D','E','F','G','H'];
    var occupiedShoots = [];
    for(var i = 0; i < allDirections.length; i++){
      if(this[allDirections[i]] != null && this[allDirections[i]].player != null){
        occupiedShoots.push(this[allDirections[i]]);
      }
    }
    return occupiedShoots;
  }

  draw(){
    //must later depend on the orientation
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var [drawLocX, drawLocY] = this.drawLocation();
    ctx.strokeRect(drawLocX-3, drawLocY-3, 6, 6);
  }

  drawLocation(){
    return [this.x*50+50, this.y*50+50];
  }
}
