/**
  Class Render
**/

var TRIANGLE_UP = 0;
var TRIANGLE_DOWN = 1;
var CIRCLE = 2;
var CIRCLE_EMPTY = 3;
var BOX = 4;
var BOX_FILLED = 5;

function Render(canvas) {
  this.ctx = canvas[0].getContext("2d");
  this.canvas_width = canvas.width();
  this.canvas_height = canvas.height();
}

Render.prototype.basicShape = function(shape, pos, w, h, scale, fillColor, strokeColor) {
  this.ctx.fillStyle = fillColor;

  if(strokeColor != null) {
    this.ctx.strokeStyle = strokeColor;
  }

  switch(shape) {
    case TRIANGLE_UP:
      this.ctx.beginPath();  
      this.ctx.moveTo(pos.x,pos.y-(scale/2));  
      this.ctx.lineTo(pos.x-(scale/2),pos.y+(scale/2));  
      this.ctx.lineTo(pos.x+(scale/2),pos.y+(scale/2));  
      this.ctx.fill();  
      break;
    case TRIANGLE_DOWN:
      this.ctx.beginPath();  
      this.ctx.moveTo(pos.x,pos.y+(scale/2));  
      this.ctx.lineTo(pos.x-(scale/2),pos.y-(scale/2));  
      this.ctx.lineTo(pos.x+(scale/2),pos.y-(scale/2));  
      this.ctx.fill();  
      break;
    case CIRCLE:
      this.ctx.beginPath();
      this.ctx.arc(pos.x,pos.y,scale,0,Math.PI*2,true);
      this.ctx.fill();  
      break;
    case CIRCLE_EMPTY:
      this.ctx.beginPath();
      this.ctx.arc(pos.x,pos.y,scale,0,Math.PI*2,true);
      this.ctx.stroke();  
      break;
    case BOX:
      this.ctx.strokeRect(pos.x,pos.y,w,h);
      break;
    case BOX_FILLED:
      this.ctx.fillRect(pos.x,pos.y,w,h);
      break;
    default:
      alert('Basic shape not supported.');
  }
}

Render.prototype.renderImage = function(img, pos) {
  this.ctx.drawImage(img,pos.x,pos.y);
}

Render.prototype.drawText = function(text, x, y, color) {
  this.ctx.fillStyle = color;
  this.ctx.fillText(text, x, y);
}

Render.prototype.clear = function(color) {
  this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
  if(color != null) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
  }
}
