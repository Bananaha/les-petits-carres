function Square(x, y) {
  var size = squareSize;
  this.context = context;
  this.xPos = x + fenceShortSide / 2;
  this.yPos = y + fenceShortSide / 2;
  this.height = size;
  this.width = size;
  this.fenceTop = false;
  this.fenceRight = false;
  this.fenceBottom = false;
  this.fenceLeft = false;
  
  this.win = function () {
      if (this.fenceTop && this.fenceRight && this.fenceBottom && this.fenceLeft) {
          this.color = 'purple';
      } else {
          this.color = 'yellow';
      }
  }
  
  this.render = function() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.xPos, this.yPos, size, this.height);
      this.win();
  };
}