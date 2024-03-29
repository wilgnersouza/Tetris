var conf = {
  portrait: $("#gamePortrait"),

  paused: false,
  debug: false,

  gameMap: [],

  blockWidth: 30,
  blockHeight: 30,

  verticalBlocks: 22,
  horizontalBlocks: 12,

  pieceMoveTime: 1000,

  activePiece: undefined,

  nextPiece: undefined,
  nextColor: undefined,

  defaultBorderBlock: $("<div class='externalBlocks'></div>"),
  defaultBlock: $("<div class='internalBlocks'></div>"),

  defaultPieceContainer: $("<div class='pieceContainer'></div>"),
  defaultPiece: $("<div class='piece'></div>"),

  numberOfPieces: 0,
  points: 0,
  level: 1,
};

var lastRun, timeAccumulator;
function update() {
  if (!lastRun) {
    lastRun = new Date().getTime();
    animationFrame(update);
    return;
  }
  var delta = new Date().getTime() - lastRun;
  lastRun = new Date().getTime();

  if (!conf.paused) {
    timeAccumulator += delta;

    if (timeAccumulator >= conf.pieceMoveTime) {
      timeAccumulator %= conf.pieceMoveTime;

      if (conf.activePiece != undefined) {
        if (pieceHitsGround() || pieceCollideBottom()) {
          updateGameMap();

          addPoints(10);
          calculateLevel();

          conf.activePiece = undefined;

          while (cleanCompletedRows());
        }
      }

      if (conf.activePiece == undefined) {
        conf.activePiece = createPiece(conf.nextPiece, conf.nextColor);
        generateNextPiece();

        conf.numberOfPieces++;
        calculateLevel();

        conf.portrait.append(conf.activePiece);

        conf.activePiece.css("display", "");
        conf.activePiece.css(
          "left",
          conf.portrait
            .children()
            .eq(conf.horizontalBlocks / 2)
            .position().left
        );
        conf.activePiece.css("top", conf.blockHeight * 2 * -1);
      } else {
        movePiece("DOWN");
      }
    }
  }
  animationFrame(update);
}

function generateNextPiece() {
  conf.nextPiece = getRandomInt(0, getPiecesModels().length - 1);
  conf.nextColor = getColors()[getRandomInt(0, getColors().length - 1)];

  var nextPiece = createPiece(conf.nextPiece, conf.nextColor);

  nextPiece.css("display", "");

  $("#nextPiecePreview").html(nextPiece);
}

function updateScoreBoard() {
  $("#points").html(conf.points);
  $("#level").html(conf.level);
}

function addPoints(points) {
  conf.points += points;
  updateScoreBoard();
}

function toogleClassAnimation(elements, classAnimation) {
  var iterations = 10;
  var timeBetweenIterations = 200;

  var stepAnimation = function (currentStep) {
    if (currentStep < iterations) {
      $(elements).each(function () {
        $(this).toggleClass(classAnimation);
      });

      setTimeout(function () {
        stepAnimation(currentStep + 1);
      }, timeBetweenIterations);
    }
  };

  stepAnimation(0);
}

function startNewLevelCssAnimation() {
  var levelParagraph = $("#level");
  var levelLabelParagraph = levelParagraph.prev();

  toogleClassAnimation([levelParagraph, levelLabelParagraph], "boxesInverse");
}

function calculateLevel() {
  var newLevel = parseInt(Math.log2(conf.numberOfPieces), 10);

  if (newLevel > conf.level) {
    startNewLevelCssAnimation();
    conf.pieceMoveTime = conf.pieceMoveTime * 0.85;

    conf.level = newLevel;
    updateScoreBoard();
  }
}

function pieceCollideBottom() {
  var piecesBlock = conf.activePiece.children();

  var firstBlock = getFirstValidBlock();
  var returnValue = false;

  for (var i = 0; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.top >= firstBlock.offset().top) {
      var arrayY = (pos.top - firstBlock.offset().top) / conf.blockHeight;
      var arrayX = (pos.left - firstBlock.offset().left) / conf.blockWidth;

      if (conf.gameMap[arrayY + 1][arrayX] == true) {
        returnValue = true;
        break;
      }
    }
  }

  return returnValue;
}

function pieceCollideLeft() {
  var piecesBlock = conf.activePiece.children();

  var firstBlock = getFirstValidBlock();
  var returnValue = false;

  for (var i = 0; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.top >= firstBlock.offset().top) {
      var arrayY = (pos.top - firstBlock.offset().top) / conf.blockHeight;
      var arrayX = (pos.left - firstBlock.offset().left) / conf.blockWidth;

      if (conf.gameMap[arrayY][arrayX - 1] == true) {
        returnValue = true;
        break;
      }
    }
  }

  return returnValue;
}

function pieceCollideRight() {
  var piecesBlock = conf.activePiece.children();

  var firstBlock = getFirstValidBlock();
  var returnValue = false;

  for (var i = 0; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.top >= firstBlock.offset().top) {
      var arrayY = (pos.top - firstBlock.offset().top) / conf.blockHeight;
      var arrayX = (pos.left - firstBlock.offset().left) / conf.blockWidth;

      if (conf.gameMap[arrayY][arrayX + 1] == true) {
        returnValue = true;
        break;
      }
    }
  }

  return returnValue;
}

function pieceHitsGround() {
  return (
    getMostDownPieceOfActivePiece() + conf.blockHeight >=
    conf.portrait
      .children()
      .eq(conf.horizontalBlocks * conf.verticalBlocks - 1)
      .position().top
  );
}

function updateGameMap() {
  var piecesBlock = conf.activePiece.children();

  var firstBlock = getFirstValidBlock();

  for (var i = 0; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.top >= firstBlock.offset().top) {
      var arrayY = (pos.top - firstBlock.offset().top) / conf.blockHeight;
      var arrayX = (pos.left - firstBlock.offset().left) / conf.blockWidth;

      conf.gameMap[arrayY][arrayX] = true;
    } else {
      gameOverScreen();
      conf.paused = true;
      break;
    }
  }
}

function removeAnimation(div) {
  var iterations = 10;
  var timeBetweenIterations = 30;

  var stepAnimation = function (currentStep) {
    if (currentStep < iterations) {
      div.css("opacity", 1 - iterations / 100.0);
      setTimeout(function () {
        stepAnimation(currentStep + 1);
      }, timeBetweenIterations);
    } else {
      div.remove();
    }
  };

  stepAnimation(0);
}

function reArragePieces(top) {
  $(".piece").each(function () {
    if ($(this).offset().top == top) {
      removeAnimation($(this));
    } else if ($(this).offset().top < top) {
      var item = $(this);
      setTimeout(function () {
        item.css("top", item.position().top + conf.blockHeight);
      }, 300);
    }
  });
}

function cleanCompletedRows() {
  var returnValue = false;
  for (var i = conf.gameMap.length - 1; i >= 0; i--) {
    var complete = true;
    for (var j = 0; j < conf.gameMap[i].length; j++) {
      if (conf.gameMap[i][j] == false) {
        complete = false;
        break;
      }
    }

    if (complete) {
      addPoints(100 * conf.level);

      reArragePieces(getFirstValidBlock().offset().top + i * conf.blockHeight);

      for (var i2 = i; i2 > 0; i2--) {
        for (var j = 0; j < conf.gameMap[i2].length; j++) {
          conf.gameMap[i2][j] = conf.gameMap[i2 - 1][j];
        }
      }

      for (var j = 0; j < conf.gameMap[i2].length; j++) {
        conf.gameMap[0][j] = false;
      }

      returnValue = true;
      break;
    }
  }
  return returnValue;
}

function printGameMap() {
  var print = "\n";
  for (var i = 0; i < conf.gameMap.length; i++) {
    for (var j = 0; j < conf.gameMap[i].length; j++) {
      print += "[" + (conf.gameMap[i][j] == false ? 0 : 1) + "]";
    }
    print += "\n";
  }
  console.log(print);
}

function printArray() {
  var print = "\n";
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      print += "[" + array[i][j] + "]";
    }
    print += "\n";
  }
  console.log(print);
}

function getFirstValidBlock() {
  return conf.portrait.children().eq(conf.horizontalBlocks + 1);
}

function createPiece(m, color) {
  var models = getPiecesModels();

  var random = models[m];

  var pieceContainer = conf.defaultPieceContainer.clone();
  pieceContainer.width(4 * conf.blockWidth);
  pieceContainer.height(4 * conf.blockHeight);

  pieceContainer.data("shape", random);

  pieceContainer.css("display", "none");

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (random[i][j] != " ") {
        var piece = conf.defaultPiece.clone();

        piece.width(conf.blockWidth - 2);
        piece.height(conf.blockHeight - 2);

        piece.css("left", j * conf.blockWidth + "px");
        piece.css("top", i * conf.blockHeight + "px");

        piece.css("background-color", color.color);
        piece.css("border-top", "1px solid " + color.weakBorder);
        piece.css("border-left", "1px solid " + color.weakBorder);

        piece.css("border-right", "1px solid " + color.strongBorder);
        piece.css("border-bottom", "1px solid " + color.strongBorder);
        pieceContainer.append(piece);
      }
    }
  }

  return pieceContainer;
}

function rotate90Degrees() {
  var array = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  var piecesBlock = conf.activePiece.children();

  var firstBlock = getFirstValidBlock();

  for (var i = 0; i < piecesBlock.length; i++) {
    var element = piecesBlock.eq(i);
    var pos = element.position();

    var arrayY = pos.top / conf.blockHeight;
    var arrayX = pos.left / conf.blockWidth;

    array[arrayY][arrayX] = element;
  }

  layers = array.length / 2;
  length = array.length - 1;

  for (var layer = 0; layer < layers; layer++) {
    for (var i = layer; i < length - layer; i++) {
      temp = array[layer][i];

      array[layer][i] = array[length - i][layer];

      array[length - i][layer] = array[length - layer][length - i];

      array[length - layer][length - i] = array[i][length - layer];

      array[i][length - layer] = temp;
    }
  }

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var el = array[i][j];
      if (el != 0 && el != undefined) {
        $(el).css("top", i * conf.blockHeight);
        $(el).css("left", j * conf.blockWidth);
      }
    }
  }
}

function getColors() {
  var colors = [];

  colors.push({
    color: "rgb(204, 000, 000)",
    strongBorder: "rgb(153, 000, 000)",
    weakBorder: "rgb(255, 000, 000)",
  }); //red
  colors.push({
    color: "rgb(000, 204, 204)",
    strongBorder: "rgb(000, 153, 153)",
    weakBorder: "rgb(000, 254, 254)",
  }); //blue

  colors.push({
    color: "rgb(153, 000, 204)",
    strongBorder: "rgb(102, 000, 153)",
    weakBorder: "rgb(205, 000, 255)",
  }); //purple
  colors.push({
    color: "rgb(204, 204, 000)",
    strongBorder: "rgb(153, 153, 000)",
    weakBorder: "rgb(255, 255, 000)",
  }); //yellow

  colors.push({
    color: "rgb(204, 000, 204)",
    strongBorder: "rgb(153, 000, 153)",
    weakBorder: "rgb(253, 000, 253)",
  }); //pink

  return colors;
}

function getPiecesModels() {
  var models = [];

  models[0] = [
    [" ", " ", " ", " "],
    [" ", "X", " ", " "],
    [" ", "X", " ", " "],
    [" ", "X", "X", " "],
  ];

  models[1] = [
    [" ", "X", " ", " "],
    [" ", "X", " ", " "],
    [" ", "X", " ", " "],
    [" ", "X", " ", " "],
  ];

  models[2] = [
    [" ", " ", " ", " "],
    [" ", "X", " ", " "],
    [" ", "X", "X", " "],
    [" ", " ", "X", " "],
  ];

  models[3] = [
    [" ", " ", " ", " "],
    [" ", "X", "X", " "],
    [" ", "X", "X", " "],
    [" ", " ", " ", " "],
  ];

  models[4] = [
    [" ", " ", " ", " "],
    [" ", "X", " ", " "],
    ["X", "X", "X", " "],
    [" ", " ", " ", " "],
  ];

  return models;
}

function buildGame() {
  conf.portrait.width(conf.blockWidth * conf.horizontalBlocks + "px");
  conf.portrait.height(conf.blockHeight * conf.verticalBlocks + "px");

  if (conf.debug) {
    conf.portrait.css("outline", "2px green dashed");
  }

  conf.defaultBlock.css("border", "1px black solid");

  conf.defaultBorderBlock.width(conf.blockWidth - 4 + "px");
  conf.defaultBorderBlock.height(conf.blockHeight - 4 + "px");

  conf.defaultBlock.width(conf.blockWidth - 2 + "px");
  conf.defaultBlock.height(conf.blockHeight - 2 + "px");

  for (var i = 0; i < conf.horizontalBlocks - 1; i++) {
    conf.portrait.append(conf.defaultBorderBlock.clone());
  }

  var lastBlockOfLine = conf.defaultBorderBlock.clone();
  lastBlockOfLine.css("clear", "right");
  conf.portrait.append(lastBlockOfLine);

  for (var i = 0; i < conf.verticalBlocks - 2; i++) {
    conf.portrait.append(conf.defaultBorderBlock.clone());
    for (var j = 0; j < conf.horizontalBlocks - 2; j++) {
      conf.portrait.append(conf.defaultBlock.clone());
    }
    conf.portrait.append(conf.defaultBorderBlock.clone());
  }

  for (var i = 0; i < conf.horizontalBlocks - 1; i++) {
    conf.portrait.append(conf.defaultBorderBlock.clone());
  }

  var lastBlockOfLine = conf.defaultBorderBlock.clone();
  lastBlockOfLine.css("clear", "right");
  conf.portrait.append(lastBlockOfLine);

  conf.gameMap = new Array(conf.verticalBlocks - 2);

  for (var i = 0; i < conf.verticalBlocks - 2; i++) {
    conf.gameMap[i] = new Array(conf.horizontalBlocks - 2);
    for (var j = 0; j < conf.horizontalBlocks - 2; j++) {
      conf.gameMap[i][j] = false;
    }
  }
}

function getMostLeftPieceOfActivePiece() {
  var piecesBlock = conf.activePiece.children();

  var mostLeft = piecesBlock.eq(0).offset().left;

  for (var i = 1; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.left < mostLeft) {
      mostLeft = pos.left;
    }
  }
  return mostLeft;
}

function getMostRightPieceOfActivePiece() {
  var piecesBlock = conf.activePiece.children();

  var mostLeft = piecesBlock.eq(0).offset().left;

  for (var i = 1; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.left > mostLeft) {
      mostLeft = pos.left;
    }
  }
  return mostLeft;
}

function getMostDownPieceOfActivePiece() {
  var piecesBlock = conf.activePiece.children();

  var mostDown = piecesBlock.eq(0).offset().top;

  for (var i = 1; i < piecesBlock.length; i++) {
    var pos = piecesBlock.eq(i).offset();

    if (pos.top > mostDown) {
      mostDown = pos.top;
    }
  }
  return mostDown;
}

function movePiece(where) {
  if (!conf.activePiece) {
    return;
  }

  switch (where) {
    case "LEFT":
      if (
        getMostLeftPieceOfActivePiece() > getFirstValidBlock().offset().left &&
        !pieceCollideLeft()
      ) {
        conf.activePiece.css(
          "left",
          conf.activePiece.position().left - conf.blockWidth
        );
      }
      break;
    case "RIGHT":
      if (
        getMostRightPieceOfActivePiece() <
          getFirstValidBlock().offset().left +
            (conf.horizontalBlocks - 3) * conf.blockWidth &&
        !pieceCollideRight()
      ) {
        conf.activePiece.css(
          "left",
          conf.activePiece.position().left + conf.blockWidth
        );
      }
      break;
    case "DOWN":
      if (!pieceHitsGround() && !pieceCollideBottom()) {
        addPoints(1);
        conf.activePiece.css(
          "top",
          conf.activePiece.position().top + conf.blockHeight
        );
      }
      break;
  }
}

$(document).bind("keydown", function (e) {
  switch (e.which) {
    case 32: //space
      conf.paused = !conf.paused;
      break;
    case 37: //left
      if (!conf.paused) movePiece("LEFT");
      break;
    case 38: //up
      if (!conf.paused) rotate90Degrees();
      break;
    case 39: //right
      if (!conf.paused) movePiece("RIGHT");
      break;
    case 40: //down
      if (!conf.paused) movePiece("DOWN");
      break;
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function windowPositions() {
  $("#instructions").css(
    "left",
    conf.portrait.offset().left - $("#instructions").width() - 50 + "px"
  );
  $("#score").css(
    "left",
    conf.portrait.width() + conf.portrait.offset().left + 50 + "px"
  );

  $("#nextPiece").css("left", $("#score").css("left"));
  $("#nextPiece").css("top", $("#score").height() + 50 + "px");

  $("#nextPiece").height(conf.blockHeight * 7);
  $("#nextPiecePreview").height(conf.blockHeight * 6);
  $("#nextPiecePreview").width(conf.blockWidth * 4);
}

function readCookies() {
  if (localStorage.getItem("tetris-points")) {
    $("#best").html(localStorage.getItem("tetris-points"));
  } else {
    $("#best").html("0");
  }
}

function startGame() {
  timeAccumulator = 0;
  generateNextPiece();
  animationFrame(update);
}

function gameOverScreen() {
  $("#gameOver").css("opacity", "0.66");
  $("#gameOver").css("display", "block");

  $("#wasted").css(
    "top",
    Math.max(
      0,
      ($(window).height() - $("#wasted").outerHeight()) / 2 +
        $(window).scrollTop()
    ) + "px"
  );
  $("#wasted").css(
    "left",
    Math.max(
      0,
      ($(window).width() - $("#wasted").outerWidth()) / 2 +
        $(window).scrollLeft()
    ) + "px"
  );

  $("#wasted").css("display", "block");

  var best = parseInt(localStorage.getItem("tetris-points"), 10);

  if (conf.points > best) {
    localStorage.setItem("tetris-points", conf.points);
  }
}

window.animationFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

buildGame();
startGame();
windowPositions();
readCookies();
