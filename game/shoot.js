class Shoot {
  /** constructs a shoot*/
  constructor(a, b){
    this.a = a;
    this.b = b;
    this.player = null;
  }

  /** returns the other point */
  getOtherPoint(point){
    if(this.a == point){
      return this.b;
    }
    else if (this.b == point) {
      return this.a;
    }
    else{
      throw "Point not included in shoot";
    }
  }

  /** draws the shoot on a canvas */
  draw(context, width, height){
    if(!this.player){
      return;
    }
    var[drawLocAX,drawLocAY] = this.a.drawLocation(context, width, height);
    var[drawLocBX,drawLocBY] = this.b.drawLocation(context, width, height);
    context.beginPath();
    context.moveTo(drawLocAX, drawLocAY);
    context.lineTo(drawLocBX, drawLocBY);
    context.strokeStyle = this.player.color;
    context.stroke();
    context.strokeStyle = '#000000'
  }
}
