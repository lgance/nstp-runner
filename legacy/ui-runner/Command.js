

let Commander = function(){}

Commander.prototype.execute = function(){
  this.commands.forEach(function(command){
    command();
  })
}

Commander.prototype.do = function(command, args) {
  this.commands.push(function() {
    command.call(null, args);
  });
};
Commander.prototype.undo = function() {
  this.commands.pop();
};


module.exports = Commander;