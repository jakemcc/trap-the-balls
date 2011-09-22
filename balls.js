

function canvas(context) {
  var a_context = context;
  var that = {};
  that.context = a_context;
  that.drawCircle = function(x, y) {
    a_context.beginPath();
    a_context.arc(x, y, 50, 0, Math.PI*2, false);
    a_context.closePath();
    //  a_context.strokeStyle = "#000";
    a_context.stroke();
    a_context.fillStyle = randomColor();
    a_context.fill()
  }
  return that;
}

var max_x;
var max_y;

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

var env;
function initGame() {
  var a_canvas = document.getElementById("a");
  max_x = a_canvas.width;
  max_y = a_canvas.height;
  env = canvas(a_canvas.getContext("2d"));
  setInterval(function() {
    var p = randomPoint();
    env.drawCircle(p.x, p.y);
  }, 100);
}


