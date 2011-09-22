
var max_x = 1000;
var max_y = 300;

function circle(context) {
  var that = {};
  var dx = 10;
  var dy = 10;

  that.makeCircle = function(x, y) {
    that.x = x;
    that.y = y;
    context.arc(x, y, 50, 0, Math.PI*2, false);
    context.closePath();
    var color = randomColor();
    context.strokeStyle = color;
    context.fillStyle = color;
  }

  that.draw = function(x, y) {
    context.beginPath();
    that.makeCircle(x, y);
    context.stroke();
    context.fill()
  };

  that.move = function() {
    if (that.x >= max_x || that.x < 0) {
      dx = -dx;
    }
    if (that.y >= max_y || that.y < 0) {
      dy = -dy;
    }
    context.clearRect(0, 0, max_x, max_y);
    that.draw(that.x + dx, that.y + dy);

  };
  return that;
}

function point(x, y) {
  p = {};
  p.x = x;
  p.y = y;
  return p;
}

function randInt(upper_bound) {
  return Math.floor(Math.random() * (upper_bound + 1));
}

var colors = ["red", "green", "blue", "brown", "pink", "lightgreen", "goldenrod"];
function randomColor() {
  return colors[randInt(colors.length)];
}

function randomPoint() {
  return point(randInt(max_x), randInt(max_y));
}

function initGame() {
  canvasElement = document.createElement("canvas");
  canvasElement.id = "a";
  canvasElement.width = max_x;
  canvasElement.height = max_y;

  document.body.appendChild(canvasElement);

  c = circle(canvasElement.getContext("2d"));
  c.draw(0, 0);
  setInterval(function() {
    c.move(5, 1)
  }, 16);
}


