var BAR_WIDTH = 2;
var BAR_GROWTH_SPEED = 6;
var BALL_RADIUS = 10;
var MAX_X = 600;
var MAX_Y = 300;
var NUM_BALLS = 4;
var gBars = [];
var gSpaces = [];
var gCanvasElement;

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
  return point(randInt(MAX_X - BALL_RADIUS*2) + BALL_RADIUS,
               randInt(MAX_Y - BALL_RADIUS*2) + BALL_RADIUS);
}

function boundryFor(x, y) {
  for (var i = 0; i < gSpaces.length; i++) {
    var space = gSpaces[i];
    if (space.contains(x, y)) {
      return space;
    }
  }
  throw "Could not find space for point [" + x + "," + y + "]";
}

function space(lowX, lowY, maxX, maxY) {
  var that = {};
  that.lowX = lowX;
  that.lowY = lowY;
  that.maxX = maxX;
  that.maxY = maxY;

  function containsX(x) { return x > lowX && x < maxX; }
  function containsY(y) { return y > lowY && y < maxY; }

  that.contains = function(x, y) {
    return containsX(x) && containsY(y);
  }

  that.split = function(x, y, verticalSplit) {
    if (verticalSplit) {
      return [space(lowX, lowY, x, maxY), space(x, lowY, maxX, maxY)];
    } else {
      return [space(lowX, lowY, maxX, y), space(lowX, y, maxX, maxY)];
    }
  }

  that.bisectedBy = function(x, y) {
    return containsX(x) && containsY(y);
  }

  return that;
}

function circle(context) {
  var that = {};
  var center = randomPoint();
  var radius =  BALL_RADIUS;
  var color = randomColor();
  var dx = 5;
  var dy = 5;

  function draw() {
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

  // I think this can still let balls go past edges. I think
  // conditionals need to have take into account motion
  function adjust() {
    var corners = boundryFor(center.x, center.y);
    if (center.x >= corners.maxX - radius || center.x <= corners.lowX + radius) {
      dx = -dx;
    }
    if (center.y >= corners.maxY - radius || center.y <= corners.lowY + radius) {
      dy = -dy;
    }
    center.x += dx;
    center.y += dy;
  }

  that.move = function() {
    adjust();
    draw();
    return that;
  };

  return that;
}

function completeBar(p1, p2, origPoint, isVertical, context) {
  function splitSpaces() {
    var nextSpaces = [];
    for (var i = 0; i < gSpaces.length; i++) {
      var space = gSpaces[i];
      if (space.bisectedBy(origPoint.x, origPoint.y)) {
        nextSpaces = nextSpaces.concat(space.split(origPoint.x,
                                                   origPoint.y,
                                                   isVertical));
      } else {
        nextSpaces.push(space);
      }
    }
    gSpaces = nextSpaces;
  }

  splitSpaces();

  var that = {};
  that.move = function() {
    context.save();
    context.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    context.stroke();
    context.restore();
    return that;
  }
  return that;
}

function bar(x, y, isVertical, context) {

  var clickPoint = point(x, y);
  var p1 = point(x, y);
  var p2 = point(x, y);
  if (isVertical) {
    p2.x += BAR_WIDTH;
  } else {
    p2.y += BAR_WIDTH;
  }

  var that = {};

  function isComplete() {
    var space = boundryFor(clickPoint.x, clickPoint.y);
    if (isVertical) {
      return p1.y <= space.lowY && p2.y >= space.maxY;
    } else {
      return p1.x <= space.lowX && p2.x >= space.maxX;
    }
  }

  function grow() {
    var space = boundryFor(clickPoint.x, clickPoint.y);
    if (isVertical) {
      p1.y = Math.max(space.lowY, p1.y - BAR_GROWTH_SPEED);
      p2.y = Math.min(space.maxY, p2.y + BAR_GROWTH_SPEED);
    } else {
      p1.x = Math.max(space.lowX, p1.x - BAR_GROWTH_SPEED);
      p2.x = Math.min(space.maxX, p2.x + BAR_GROWTH_SPEED);
    }
  }

  function draw() {
    context.save();
    context.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    context.stroke();
    context.restore();
  }

  function next() {
    if (isComplete()) {
      return completeBar(p1, p2, clickPoint,
                         isVertical, context);
    }
    return that;
  }

  that.move = function() {
    grow();
    draw();
    return next();
  }

  return that;
}

function border(context) {
  var that = {};
  that.draw = function() {
    context.save();
    context.strokeStyle = "gray";
    context.strokeRect(0, 0, MAX_X, MAX_Y);
    context.restore();
    return that;
  }
  return that;
}

function onClick(e) {
  var x = e.pageX;
  var y = e.pageY;

  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;

  var b = bar(x, y, e.shiftKey, gCanvasElement.getContext("2d"));
  gBars.push(b);
}

function initGame() {
  gSpaces.push(space(0, 0, MAX_X, MAX_Y));

  canvasElement = document.createElement("canvas");
  canvasElement.id = "a";
  canvasElement.width = MAX_X;
  canvasElement.height = MAX_Y;
  document.body.appendChild(canvasElement);
  gCanvasElement = canvasElement;
  var context = canvasElement.getContext("2d");
  gContext = context;

  var outline = border(context);

  var circles = []
  for (var i = 0; i < NUM_BALLS; i++) {
    circles.push(circle(context));
  }

  setInterval(function() {
    context.clearRect(0, 0, MAX_X, MAX_Y);

    outline.draw();
    
    for (var i = 0; i < circles.length; i++) {
      circles[i] = circles[i].move();
    }
    
    for (var i = 0; i < gBars.length; i++) {
      gBars[i] = gBars[i].move();
    }
  }, 16);

  canvasElement.addEventListener("click", onClick, false);
}


