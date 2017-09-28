function Fence(x, y, w, h, color) {
  this.context = context;
  this.height = h;
  this.width = w;
  this.xPos = x - fenceShortSide / 2;
  this.yPos = y - fenceShortSide / 2
  
  this.render = function() {
      this.context.fillStyle = color;
      this.context.fillRect(this.xPos, this.yPos, this.width, this.height);
  };
}