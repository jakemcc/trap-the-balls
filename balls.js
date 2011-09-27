var BAR_WIDTH = 2;
var BAR_GROWTH_SPEED = 6;
var BAR_DECAY_SPEED = 15;
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

function distanceBetween(p, q) {
  return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
}

function collides(p, q, isVertical, center, radius) {
  var pp, qq;
  if (isVertical) {
    pp = point(p.x - radius, p.y);
    qq = point(q.x + radius, q.y);
  } else {
    pp = point(p.x, p.y - radius);
    qq = point(q.x, q.y + radius);
  }

  return distanceBetween(p, center) <= radius ||
    distanceBetween(q, center) <= radius ||
    ((pp.x <= center.x && center.x <= qq.x) &&
     (pp.y <= center.y && center.y <= qq.y))
}

function ball(context) {
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

  function checkCollision() {
    for (var i = 0; i < gBars.length; i++) {
      if (!gBars[i].isComplete && collides(gBars[i].p1,
                                           gBars[i].p2,
                                           gBars[i].isVertical,
                                           center,
                                           radius)) {
        gBars[i].hasCollided = true;
      }
    }
  }

  that.move = function() {
    adjust();
    checkCollision();
    draw();
    return that;
  };

  return that;
}

function noop() {
  var that = {};
  that.isComplete = true;
  that.move = function() {
    return that;
  }
  return that;
}

function deadBar(p1, p2, context, remainingFrames) {
  var that = {};

  that.isComplete = true;
  that.move = function() {
    if (remainingFrames === 0) {
      return noop();
    }
    context.save();
    context.fillStyle = "gray";
    context.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
//    context.stroke();
    context.restore();
    return deadBar(p1, p2, context, remainingFrames - 1);
  }
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
  that.p1 = p1;
  that.p2 = p2;
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

  var that = {};
  that.hasCollided = false;
  that.p1 = point(x, y);
  that.p2 = point(x, y);
  that.isVertical = isVertical;
  if (isVertical) {
    that.p2.x += BAR_WIDTH;
  } else {
    that.p2.y += BAR_WIDTH;
  }

  function isComplete() {
    var space = boundryFor(clickPoint.x, clickPoint.y);
    if (isVertical) {
      return that.p1.y <= space.lowY && that.p2.y >= space.maxY;
    } else {
      return that.p1.x <= space.lowX && that.p2.x >= space.maxX;
    }
  }

  function grow() {
    var space = boundryFor(clickPoint.x, clickPoint.y);
    if (isVertical) {
      that.p1.y = Math.max(space.lowY, that.p1.y - BAR_GROWTH_SPEED);
      that.p2.y = Math.min(space.maxY, that.p2.y + BAR_GROWTH_SPEED);
    } else {
      that.p1.x = Math.max(space.lowX, that.p1.x - BAR_GROWTH_SPEED);
      that.p2.x = Math.min(space.maxX, that.p2.x + BAR_GROWTH_SPEED);
    }
  }

  function draw() {
    context.save();
    context.fillRect(that.p1.x, that.p1.y, that.p2.x - that.p1.x, that.p2.y - that.p1.y);
    context.stroke();
    context.restore();
  }

  function next() {
    if (isComplete()) {
      return completeBar(that.p1, that.p2, clickPoint,
                         isVertical, context);
    }
    return that;
  }

  that.move = function() {
    if (that.hasCollided) {
      return deadBar(this.p1, this.p2, context, BAR_DECAY_SPEED);
    }
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

  var balls = []
  for (var i = 0; i < NUM_BALLS; i++) {
    balls.push(ball(context));
  }

  setInterval(function() {
    context.clearRect(0, 0, MAX_X, MAX_Y);

    outline.draw();

    for (var i = 0; i < balls.length; i++) {
      balls[i] = balls[i].move();
    }

    for (var i = 0; i < gBars.length; i++) {
      gBars[i] = gBars[i].move();
    }
  }, 16);

  canvasElement.addEventListener("click", onClick, false);
}


