function Player (name, color) {
  saymyname(){
    window.alert('My name is: ' + this.name);
  }

  this.name = name;
  this.color = color;
}
