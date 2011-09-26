var MAX_X = 600;
var MAX_Y = 300;
var NUM_CIRCLES = 4;
var elements = [];
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
  return point(randInt(MAX_X), randInt(MAX_Y));
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
  var center = point(MAX_X / 2, MAX_Y / 2);
  var radius =  10;
  var color = randomColor();
  var dx = randInt(10) + 1;
  var dy = randInt(10) + 1;

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

function completeBar(upperPoint, origPoint, width, height, isVertical, context) {
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
    context.fillRect(upperPoint.x, upperPoint.y, width, height);
    context.stroke();
    context.restore();
    return that;
  }
  return that;
}

function bar(x, y, isVertical, context) {
  var clickPoint = point(x, y);
  var that = {};
  var upperX = x;
  var upperY = y;
  var width = 1;
  var height = 1;

  function isComplete() {
    // doing boundry check in here supports multiple bars ending so
    // space is dynamic ove life, could not do this and just
    // figure out space once
    var space = boundryFor(clickPoint.x, clickPoint.y);
    if (isVertical) {
      return upperY <= space.lowY && height + upperY >= space.maxY;
    } else {
      return upperX <= space.lowX && width + upperX >= space.maxX;
    }
  }

  function grow() {
    if (isVertical) {
      height += 4;
      upperY -= 2;
    } else {
      upperX -= 2;
      width += 4;
    }
  }

  function draw() {
    context.save();
    context.fillRect(upperX, upperY, width, height);
    context.stroke();
    context.restore();
  }

  function next() {
    if (isComplete()) {
      return completeBar(point(upperX, upperY),
                         clickPoint, width, height,
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

function onClick(e) {
  var x = e.pageX;
  var y = e.pageY;

  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;

  var b = bar(x, y, e.shiftKey, gCanvasElement.getContext("2d"));
  elements.push(b);
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


  for (var i = 0; i < NUM_CIRCLES; i++) {
    elements.push(circle(context));
  }

  setInterval(function() {
    context.clearRect(0, 0, MAX_X, MAX_Y);
    for (var i = 0; i < elements.length; i++) {
      elements[i] = elements[i].move();
    }
  }, 16);

  canvasElement.addEventListener("click", onClick, false);
}


