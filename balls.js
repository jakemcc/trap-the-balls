

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

var colors = ["red", "green", "blue", "brown", "pink", "lightgreen", "goldenrod"];
function randomColor() {
  return colors[Math.floor(Math.random() * (colors.length + 1))];
}

function randomPoint() {
  return point(Math.floor(Math.random() * max_x),
               Math.floor(Math.random() * max_y));
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


