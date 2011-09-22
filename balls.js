
function canvas(context) {
  var a_context = context;
  var that = {};
  that.drawCircle = function(x, y) {
    a_context.beginPath();
    a_context.arc(x, x, 50, 0, Math.PI*2, false);
    a_context.closePath();
    //  a_context.strokeStyle = "#000";
    a_context.stroke();
    a_context.fillStyle = "#4aa";
    a_context.fill()
  }
  return that;
}

function initGame() {
  var a_canvas = document.getElementById("a");
  var env = canvas(a_canvas.getContext("2d"));
  env.drawCircle(300, 300);

}


