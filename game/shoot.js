class Shoot {
  constructor(a, b){
    this.a = a;
    this.b = b;
    this.player = null;
  }

  getOtherPoint(point){
    if(this.a == point){
      return this.b;
    }
    else if (this.b == point) {
      return this.a;
    }
  }

  draw(){
    if(!this.player){
      return;
    }
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var[drawLocAX,drawLocAY] = this.a.drawLocation();
    var[drawLocBX,drawLocBY] = this.b.drawLocation();
    ctx.beginPath();
    ctx.moveTo(drawLocAX, drawLocAY);
    ctx.lineTo(drawLocBX, drawLocBY);
    ctx.strokeStyle = this.player.color;
    ctx.stroke();
    ctx.strokeStyle = '#000000'
  }
}
