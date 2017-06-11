class Ball {
  constructor(point){
    this.point = point;
  }

  draw(){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var [drawLocX, drawLocY] = this.point.drawLocation();
    ctx.fillRect(drawLocX-5, drawLocY-5, 10, 10);
  }
}
