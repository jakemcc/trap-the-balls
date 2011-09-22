var max_x = 1000;
var max_y = 300;

function point(x, y) {
  p = {};
  p.x = x;
  p.y = y;
  return p;
}

function randInt(upper_bound) {
  return Math.floor(Math.random() * upper_bound);
}

var colors = ["red", "green", "blue", "brown", "pink", "lightgreen", "goldenrod",
              "purple"];
function randomColor() {
  return colors[randInt(colors.length)];
}

function randomPoint() {
  return point(randInt(max_x), randInt(max_y));
}

function circle(context) {
  var that = {};
  var center = point(max_x / 2, max_y / 2);
  var radius =  randInt(50) + 10;
  var color = randomColor();
  var dx = randInt(10) + 1;
  var dy = randInt(10) + 1;

  that.draw = function() {
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI*2, false);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.closePath();
    context.stroke();
    context.fill()
  };

  that.move = function() {
    if (center.x >= max_x - radius || center.x < 0 + radius) {
      dx = -dx;
    }
    if (center.y >= max_y - radius || center.y < 0 + radius) {
      dy = -dy;
    }
    center.x += dx;
    center.y += dy;
    that.draw();
  };

  return that;
}

function initGame() {
  canvasElement = document.createElement("canvas");
  canvasElement.id = "a";
  canvasElement.width = max_x;
  canvasElement.height = max_y;

  document.body.appendChild(canvasElement);

  var context = canvasElement.getContext("2d");
  var num = 10;
  var circles = [];
  for (var i = 0; i < num; i++) {
    circles[i] = circle(context);
  }

  setInterval(function() {
    context.clearRect(0, 0, max_x, max_y);

    for (var i = 0; i < num; i++) {
      circles[i].move();
    }

  }, 16);
}
