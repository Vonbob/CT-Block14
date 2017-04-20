var gameIntervalID;
var canvas;
var ctx;
var width;
var height;
var bgImg, knightImg, wallImg, fireBallImg, boomImg; 

var restartBtn = document.querySelector(".restart-btn");

var move;

var knight = {
    x: 42, y: 42,
    size: 32,
    reset: function () { this.x = 42; this.y = 42; }
};

var exit = {
    x: 560, y: 40,
    size: 40
};

/*  canvas resolution: 640x480
    one section is 40x40
    horizontal: 16 sections
    vertical: 12 sections   */

//xs and ys - section coordinates
var size = 40;
/* array that represents sections through which player character cannot traverse */
var wall = [
    { xs: 0, ys: 0, orientation: "horizontal", sections: 16 },
    { xs: 0, ys: 11, orientation: "horizontal", sections: 16 },
    { xs: 0, ys: 1, orientation: "vertical", sections: 10 },
    { xs: 15, ys: 1, orientation: "vertical", sections: 10 },
    { xs: 2, ys: 1, orientation: "vertical", sections: 3 },
    { xs: 2, ys: 6, orientation: "vertical", sections: 4 },
    { xs: 3, ys: 6, orientation: "horizontal", sections: 2 },
    { xs: 4, ys: 2, orientation: "vertical", sections: 5 },
    { xs: 5, ys: 2, orientation: "horizontal", sections: 4 },
    { xs: 10, ys: 1, orientation: "vertical", sections: 4 },
    { xs: 4, ys: 8, orientation: "vertical", sections: 3 },
    { xs: 6, ys: 4, orientation: "vertical", sections: 6 },
    { xs: 8, ys: 3, orientation: "vertical", sections: 4 },
    { xs: 9, ys: 6, orientation: "horizontal", sections: 2 },
    { xs: 7, ys: 8, orientation: "horizontal", sections: 4 },
    { xs: 8, ys: 10, orientation: "vertical", sections: 1 },
    { xs: 10, ys: 9, orientation: "horizontal", sections: 4 },
    { xs: 12, ys: 6, orientation: "vertical", sections: 2 },
    { xs: 13, ys: 7, orientation: "horizontal", sections: 2 },
    { xs: 11, ys: 4, orientation: "horizontal", sections: 3 },
    { xs: 12, ys: 2, orientation: "horizontal", sections: 3}
];

/* array containing data about moving obstacles */
var fireBalls = [
    {
        xStart: 160, yStart: 160, moveDir: "x-left",
        endPos: 0, currPos: 160, speed: 2,
        reset: function () { this.currPos = 160; }
    },
    {
        xStart: 120, yStart: 440, moveDir: "y-top",
        endPos: 260, currPos: 440, speed: 1,
        reset: function () { this.currPos = 440; }
    },
    {
        xStart: 90, yStart: 40, moveDir: "x-right",
        endPos: 400, currPos: 80, speed: 1,
        reset: function () { this.currPos = 80; }
    },
    {
        xStart: 360, yStart: 0, moveDir: "y-bottom",
        endPos: 240, currPos: 0, speed: 1,
        reset: function () { this.currPos = 0; }
    },
    {
        xStart: 200, yStart: 440, moveDir: "y-top",
        endPos: 80, currPos: 440, speed: 1,
        reset: function () { this.currPos = 440; }
    },
    {
        xStart: 320, yStart: 400, moveDir: "x-right",
        endPos: 600, currPos: 320, speed: 1,
        reset: function () { this.currPos = 320; }
    },
    {
        xStart: 240, yStart: 280, moveDir: "x-right",
        endPos: 480, currPos: 240, speed: 1,
        reset: function () { this.currPos = 240 }
    },
    {
        xStart: 600, yStart: 120, moveDir: "x-left",
        endPos: 400, currPos: 600, speed: 2,
        reset: function () { this.currPos = 600 }
    }
];

var loadCanvas = function () {
    canvas = document.getElementById("arena");
    ctx = canvas.getContext("2d");
    width = canvas.width;
    height = canvas.height;
}

var loadAssets = function () {
    bgImg = new Image();
    bgImg.src = "images/bg.png";

    knightImg = new Image();
    knightImg.src = "images/knight.png";

    wallImg = new Image();
    wallImg.src = "images/wall.png";

    fireBallImg = new Image();
    fireBallImg.src = "images/fireball.png";

    boomImg = new Image();
    boomImg.src = "images/boom.png";
}

var addDOMEventListeners = function () {
    window.onkeydown = function (event) {
        move = event.key;
    };
    window.onkeyup = function () {
        move = undefined;
    };
    restartBtn.onclick = function () {
        restartBtn.setAttribute("hidden", "hidden");
        reset();
        gameIntervalID = setInterval(gameLoop, 16);
    };
}

var colisionWithWall = function (newKnightX, newKnightY, wallX, wallY) {
    var knightLeft = newKnightX;
    var knightRight = newKnightX + knight.size;
    var knightTop = newKnightY;
    var knightBottom = newKnightY + knight.size;

    var wallLeft = wallX;
    var wallRight = wallX + size;
    var wallTop = wallY;
    var wallBottom = wallY + size;

    if ((knightLeft > wallRight) || (knightRight < wallLeft) || (knightTop > wallBottom) || (knightBottom < wallTop)) {
        return false;
    }
    return true;
};

var checkWallCollision = function (knightX, knightY) {
    var i = 0;
    for (; i < wall.length; ++i) {
        var x = wall[i].xs * size;
        var y = wall[i].ys * size;
        if (wall[i].orientation === "horizontal") {
            var s = 0;
            for (; s < wall[i].sections; ++s) {
                if (colisionWithWall(knightX, knightY, x, y))
                    return true;
                x += size;
            }
        }
        else {
            var s = 0;
            for (; s < wall[i].sections; ++s) {
                if (colisionWithWall(knightX, knightY, x, y))
                    return true;
                y += size;
            }
        }
    }
    return false;
};


var updateState = function () {
    var distance = 2;
    switch (move) {
        case "ArrowUp":
            if (checkWallCollision(knight.x, knight.y - distance))
                return;
            knight.y -= distance;
            break;
        case "ArrowDown":
            if (checkWallCollision(knight.x, knight.y + distance))
                return;
            knight.y += distance;
            break;
        case "ArrowLeft":
            if (checkWallCollision(knight.x - distance, knight.y))
                return;
            knight.x -= distance;
            break;
        case "ArrowRight":
            if (checkWallCollision(knight.x + distance, knight.y))
                return;
            knight.x += distance;
            break;
    }
};

var drawWall = function () {
    var i = 0;
    for (; i < wall.length; ++i) {
        var x = wall[i].xs * size;
        var y = wall[i].ys * size;
        if (wall[i].orientation === "horizontal") {
            var s = 0;
            for (; s < wall[i].sections; ++s) {
                ctx.drawImage(wallImg, x, y, size, size);
                x += size;
            }
        }
        else {
            var s = 0;
            for (; s < wall[i].sections; ++s) {
                ctx.drawImage(wallImg, x, y, size, size);
                y += size;
            }
        }
    }
};

var drawFireBalls = function () {
    var i = 0;
    for (; i < fireBalls.length; ++i) {

        if (fireBallControl(fireBalls[i])) {
            gameOver();
            return;
        }
    }
};

var fireBallControl = function (fb) {
    var fbX;
    var fbY;
    switch (fb.moveDir) {
        case "x-left":
            if (fb.currPos <= fb.endPos) {
                fb.currPos = fb.xStart;
            }
            else {
                fb.currPos -= fb.speed;
            }
            fbX = fb.currPos;
            fbY = fb.yStart;
            break;
        case "x-right":
            if (fb.currPos >= fb.endPos) {
                fb.currPos = fb.xStart;
            }
            else
            {
                fb.currPos += fb.speed;
            }
            fbX = fb.currPos;
            fbY = fb.yStart;
            break;
        case "y-top":
            if (fb.currPos <= fb.endPos) {
                fb.currPos = fb.yStart;
            }
            else {
                fb.currPos -= fb.speed;
            }
            fbX = fb.xStart;
            fbY = fb.currPos;
            break;
        case "y-bottom":
            if (fb.currPos >= fb.endPos) {
                fb.currPos = fb.yStart;
            }
            else {
                fb.currPos += fb.speed;
            }
            fbX = fb.xStart;
            fbY = fb.currPos;
            
            break;
    }
    ctx.drawImage(fireBallImg, fbX, fbY, size, size);


    if (colisionWithFireBall(fbX, fbY)) {
        return true;
    }

    return false;

};

var colisionWithFireBall = function (fbX, fbY) {
    var knightLeft = knight.x;
    var knightRight = knight.x + knight.size;
    var knightTop = knight.y;
    var knightBottom = knight.y + knight.size;

    var fbLeft = fbX + 5;
    var fbRight = fbX + size - 10;
    var fbTop = fbY + 5;
    var fbBottom = fbY + size - 10;

    if ((knightLeft > fbRight) || (knightRight < fbLeft) || (knightTop > fbBottom) || (knightBottom < fbTop)) {
        return false;
    }
    return true;
};

var reset = function () {
    knight.reset();
    var i = 0;
    for (; i < fireBalls.length; ++i) {
        fireBalls[i].reset();
    }
};

var gameOver = function () {
    clearInterval(gameIntervalID);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bgImg, 0, 0, width, height);
    drawWall();
    ctx.drawImage(boomImg, knight.x - 10, knight.y - 10, 60, 60);

    ctx.fillStyle = "red";
    ctx.font = "64px serif";
    ctx.fillText("GAME OVER", 130, 260);

    restartBtn.removeAttribute("hidden");
};

var drawExit = function () {
    ctx.strokeStyle = "lightblue";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(560, 40);
    ctx.lineTo(600, 80);
    ctx.moveTo(600, 40);
    ctx.lineTo(560, 80);
    ctx.stroke();
};

var drawFrame = function () {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bgImg, 0, 0, width, height);
    drawWall();
    ctx.drawImage(knightImg, knight.x, knight.y, knight.size, knight.size);
    drawExit();
    drawFireBalls();
};


var checkExit = function() {
    var knightLeft = knight.x;
    var knightRight = knight.x + knight.size;
    var knightTop = knight.y;
    var knightBottom = knight.y + knight.size;

    var exitLeft = exit.x;
    var exitRight = exit.x + exit.size;
    var exitTop = exit.y;
    var exitBottom = exit.y + exit.size;

    if ((knightLeft > exitRight) || (knightRight < exitLeft) || (knightTop > exitBottom) || (knightBottom < exitTop)) {
        return false;
    }
    return true;
}

var finishGame = function () {
    clearInterval(gameIntervalID);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bgImg, 0, 0, width, height);
    drawWall();
    drawExit();

    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    ctx.fillText("You've managed to excape", 60, 240);
    ctx.fillText("the labyrinth", 200, 300);

    restartBtn.removeAttribute("hidden");
};

var gameLoop = function () {
    updateState();
    drawFrame();
    if (checkExit()) {
        finishGame();
    }
};

loadAssets();
loadCanvas();
addDOMEventListeners();

gameIntervalID = setInterval(gameLoop, 16);








