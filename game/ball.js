function Ball (point){
  /** draws the ball on a canvas */
  draw(context, width, height) {
    var [drawLocX, drawLocY] = this.point.drawLocation(context, width, height);
    context.fillRect(drawLocX - 5, drawLocY - 5, 10, 10);
  }
  this.point = point;
}
