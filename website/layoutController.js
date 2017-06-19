/** layouts */
//prototype
function layout(layoutName, layoutFile, layoutController, initFunction, destFunction){
  this.name = layoutName; // layout name
  this.file = layoutFile;         // path to layout html file
  this.layoutController = layoutController;
  this.init = initFunction;      // initializer init = function(par){//initialize layout(init variables, callbacks)}
  this.dest = destFunction;      //destructor dest = function(){//destroy layout}
  //add additional functions (callbacks), register them in init and destroy them in dest
  // onButton = function(){//do some struff}
}
/** layout controller */
function layoutController(parentDiv){
  this.layouts = {};
  this.currentLayout = null;
  this.layoutParentName = parentDiv;
  //check if parentDiv exists
  if(!document.getElementById(this.layoutParentName)){
    console.log('Parent div does not exist');
    return null;
  }

  //functions
  this.initializeLayout = function(layoutName, par){
    if(!this.currentLayout){
      var newLayout = this.layouts[layoutName];
      if(newLayout){
        this.currentLayout = newLayout;
        $('#'+this.layoutParentName).load(newLayout.file, function(){
          newLayout.init(par);
        });
      }
      else{
        console.log('Layout ' + layoutName + 'does not exist. Register it with registerLayout(layout) first.');
      }
    }
    else{
      console.log('There is a current Layout set! Use changeLayout to change it.');
    }
  }

  this.changeLayout = function(layoutName, par){
    if(this.currentLayout){
      var newLayout = this.layouts[layoutName];
      if(newLayout){
        this.currentLayout.dest();
        this.currentLayout = newLayout;
        $('#'+this.layoutParentName).load(newLayout.file, function(){
          newLayout.init(par);
        });
      }
      else{
        console.log('Layout ' + layoutName + 'does not exist. Register it with registerLayout(layout) first.');
      }
    }
    else{
      console.log('There is no current Layout set! Use initializeLayout to set it.')
    }
  }

  this.registerLayout = function(layout){
    if(!layout.name){
      console.log('Layout has no name. (layout.name)');
    }
    else if(!layout.file){
      console.log('Layout ' + layout.name + ' has no file. (layout.file)');
    }
    else if(!layout.init){
      console.log('Layout ' + layout.name + ' has no initializer. (layout.init)');
    }
    else if(!layout.dest){
      console.log('Layout ' + layout.name + ' has no destructor. (layout.dest)');
    }
    else if(layout.layoutController != this){
      console.log('Layout ' + layout.name + ' has wrong controller. (layout.layoutController)');
    }
    else{
      this.layouts[layout.name] = layout;
    }
  }
}
