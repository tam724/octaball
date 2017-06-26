function Shoot(a, b) {
  /** returns the other point */
  this.getOtherPoint = function(point) {
    if (this.a == point) {
      return this.b;
    } else if (this.b == point) {
      return this.a;
    } else {
      throw "Point not included in shoot";
    }
  }

  this.a = a;
  this.b = b;
  this.player = null;
}

if (typeof module !== 'undefined') {
  module.exports = Shoot;
}
