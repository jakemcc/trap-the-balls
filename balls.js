
var max_x = 1000;
var max_y = 300;

function circle(center, context) {
  var that = {};
  var dx = randInt(10);
  var dy = randInt(10);

  function makeCircle() {
    context.arc(center.x, center.y, 50, 0, Math.PI*2, false);
    context.closePath();
//    var color = randomColor();
    var color = "blue";
    context.strokeStyle = color;
    context.fillStyle = color;
  };

  that.draw = function() {
    context.beginPath();
    makeCircle();
    context.stroke();
    context.fill()
  };

  that.move = function() {
    if (center.x >= max_x || center.x < 0) {
      dx = -dx;
    }
    if (center.y >= max_y || center.y < 0) {
      dy = -dy;
    }
    center.x += dx;
    center.y += dy;
    context.clearRect(0, 0, max_x, max_y);
    that.draw();
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

  c = circle(randomPoint(), canvasElement.getContext("2d"));
  c.draw(0, 0);
  setInterval(function() {
    c.move();
  }, 16);
}


