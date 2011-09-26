var max_x = 1000;
var max_y = 300;
var elements = [];

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
    context.save();
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI*2, false);
    context.closePath();
    context.strokeStyle = color;
    context.fillStyle = color;

    context.stroke();
    context.fill();
    context.restore();
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

function onClick(e) {
  var x = e.pageX;
  var y = e.pageY;

  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;

  var b = bar(x, y, e.shiftKey, gCanvasElement.getContext("2d"));
  elements.push(b);
}

var gCanvasElement;

function bar(x, y, isVertical, context) {
  var that = {};
  var upperX = x;
  var upperY = y;
  var width = 4;
  var height = 4;
  that.move = function() {
    if (isVertical) {
      height += 4;
      upperY -= 2;
    } else {
      upperX -= 2;
      width += 4;
    }
    context.save();
    context.fillRect(upperX, upperY, width, height);
    //    context.strokeStyle = "black";
    context.stroke();
    context.restore();
  }
  return that;
}



function initGame() {
  canvasElement = document.createElement("canvas");
  canvasElement.id = "a";
  canvasElement.width = max_x;
  canvasElement.height = max_y;
  document.body.appendChild(canvasElement);
  gCanvasElement = canvasElement;
  var context = canvasElement.getContext("2d");
  gContext = context;
  for (var i = 0; i < 4; i++) {
    elements.push(circle(context));
  }

  setInterval(function() {
    context.clearRect(0, 0, max_x, max_y);
    for (var i = 0; i < elements.length; i++) {
      elements[i].move();
    }
  }, 16);

  canvasElement.addEventListener("click", onClick, false);
}
