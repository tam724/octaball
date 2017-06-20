function Player () {
  this.initialize = function(name, color){
    this.name = name;
    this.color = color;
    this.initialized = true;
  }

  this.color = null;
  this.name = null;
  this.connected = false;
  this.initialized = false;
  this.again = false;
}

module.exports = Player;
