/**
 * ----------------------------------------------------------------------------
 * Conway's Game of Life
 * ----------------------------------------------------------------------------
 * A JavaScript implementation of Conway's Game of Life with a couple of
 * alterations:
 *
 * 1. Genetics - A cell has a color and it inherited from its 3 parents.
 * 2. Maturity - A cell matures each generation it survives (opacity).
 *
 * @author Jack Kinsey
 * @version 1.0.0
 */

/**
 * Cell size in pixels. Cells are squares so we only need
 * to specify one value (it is used for length and width).
 */
var CELL_SIZE = 15;

// TODO: this should be variable (and set by the user).
/** The frames per second in which the simulation should run. */
var fps = 1;
var speed = 1000/fps;

/** Flag to determine if game is running, false by default. */
var running = false;

/** The canvas where all our drawing takes place. */
var canvas = document.getElementById('canvas');

/** The 2D context of the canvas to handle the draw calls. */
var context = canvas.getContext('2d');

/**
 * Model for Cell object.
 *
 * @constructor
 * @param {Number} x - The x-coordinate of the cell in terms of the Board.
 * @param {Number} y - The y-coordinate of the cell in terms of the Board.
 */
function Cell (x, y, color) {
    this.x = x;
    this.y = y;
    this.isAlive = false;
    this.maturity = 0.1;
    this.color = color || '#000000';
}

/**
 * Draws the Cell object on the canvas.
 */
Cell.prototype.draw = function () {
    // Clear the rectangle that encloses this Cell (but making sure it
    // is smaller than the grid lines so those don't get cleared).
    context.clearRect(this.x * CELL_SIZE + 1,
                      this.y * CELL_SIZE + 1,
                      CELL_SIZE - 2,
                      CELL_SIZE - 2 );

    // Draw this Cell if it is alive.
    if (this.isAlive) {
        // Set alpha value to the Cell's maturity value.
        context.globalAlpha = this.maturity;

        // Color the Cell using its color value.
        context.fillStyle = this.color;

        // Begin the draw path
        context.beginPath();

        // Draw an arc with the center point at the center of this Cell,
        // and a radius slightly smaller than the CELL_SIZE (so it fits
        // nicely in the grid).
        context.arc((this.x * CELL_SIZE) + CELL_SIZE / 2,
                    (this.y * CELL_SIZE) + CELL_SIZE / 2,
                    CELL_SIZE / 2 - 2,
                    0, 2 * Math.PI);

        // Close the path to finish the circle.
        context.closePath();

        // Fill the circle with the Cell's color.
        context.fill();

        // Set the styling & draw the outline of the Cell.
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();
    }

    // Set global alpha back to 1 so everything else is drawn correctly.
    context.globalAlpha = 1;
};

/**
 * Toggle's the Cell object; killing it if it is
 * alive or resurrecting it if it is dead.
 */
Cell.prototype.toggle = function () {
    var color = colorPalette.getColor();

    if (this.isAlive) {
        if (this.color === color) {
            this.kill();
        } else {
            this.color = color;
        }
    } else {
        this.isAlive = true;
        this.color = color;
    }

    // Immediately draw this Cell instead of waiting on the Board
    // to do so, this helps the app feel more responsive to user input.
    this.draw();
};

/**
 * Kills the Cell object.
 */
Cell.prototype.kill = function() {
    // Set alive status to false and reset the maturity value.
    this.isAlive = false;
    this.maturity = 0.1;

    // Cell is dead so make sure it is drawn immediately.
    // This is to make sure the board is redrawn as soon
    // as the Clear button is pressed.
    this.draw();
};

/**
 * Model for Board object. The game's board in which the
 * Cell objects live.
 *
 * @constructor
 * @param {Number} width - The width, in Cells, of the game board.
 * @param {Number} height - The height, in Cells, of the game board.
 */
function Board(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.next = [];

    // Convert the width & height of the board to be
    // in terms of pixels and set those values to
    // the width & height of the canvas, respectively.
    context.canvas.width = this.width * CELL_SIZE;
    context.canvas.height = this.height * CELL_SIZE;

    // Initialize the board with dead cells.
    for (var x = 0; x < this.width; x++) {
        var colCell = [];
        var colState = [];

        for (var y = 0; y < this.height; y++) {
            colCell[y] = new Cell(x, y);
            colState[y] = false;
        }

        this.cells[x] = colCell;
        this.next[x] = colState;
    }
}

/**
 * Clears the Board with dead cells by traversing it and
 * killing each Cell.
 */
Board.prototype.clear = function () {
    console.log("clear board");
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.cells[x][y].kill();
        }
    }
};

// TODO: draw functions should have a reference to the context?
// i.e. function(ctx)?
/**
 * Draws the current state of the Board object by traversing
 * the Board and drawing each Cell object.
 */
Board.prototype.draw = function () {
    var xPos;
    var yPos;
    var widthPx = this.width * CELL_SIZE;
    var heightPx = this.height * CELL_SIZE;
    context.clearRect(0, 0, widthPx, heightPx);
    //context.beginPath();

    // TODO: move drawing code to two functions?
    // drawCells and drawGridlines?

    // For every cell on the board...
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // Draw the cell.
            this.cells[x][y].draw();
        }
    }

    // TODO: draw grid once? Figure out a way to make that work?
    for (var i = 0; i < this.width; i++) {
        xPos = i * CELL_SIZE;
        context.beginPath();
        context.moveTo(xPos, 0);
        context.lineTo(xPos, heightPx);
        context.closePath();
        context.strokeStyle = '#ddd';
        context.stroke();
    }
    for (var j = 0; j < this.height; j++) {
        yPos = j * CELL_SIZE;
        context.beginPath();
        context.moveTo(0, yPos);
        context.lineTo(widthPx, yPos);
        context.closePath();
        context.strokeStyle = '#ddd';
        context.stroke();
    }
};

/**
 * Updates the state of each Cell object for the Board.
 */
Board.prototype.update = function () {
    // Determine the state of the next generation of each
    // Cell object on the Board.
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.next[x][y] = this.cells[x][y].isAlive &&
                              this.getLivingNeighbors(x, y) === 2 ||
                              this.getLivingNeighbors(x, y) === 3;
        }
    }

    // Use the state of the next generation to affect each
    // Cell object on the Board.
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // The current Cell
            var cell = this.cells[x][y];

            // The "alive" status of this Cell in the next generation.
            var aliveNextGen = this.next[x][y];

            // If this Cell is currently alive and it is
            // still alive next generation
            if (cell.isAlive && aliveNextGen) {
                // then increment this Cell's maturity if it isn't
                // already at the maximum of 1
                if (cell.maturity < 1)
                    cell.maturity += 0.1;
            } else if (cell.isAlive && !aliveNextGen) {
                // Otherwise, if this Cell is currently alive and
                // it is not alive next generation, kill it.
                cell.kill();
            } else if (!cell.isAlive && aliveNextGen) {
                // Otherwise, if this Cell is currently dead and
                // is is alive next generation, bring it to life;
                cell.isAlive = true;
            }
        }
    }
};

/**
 * Retrieves the number of living Cell objects surrounding
 * the Cell at the given location.
 *
 * @param {Number} x - The x-coordinate of the Cell object in terms of the Board.
 * @param {Number} y - The y-coordinate of the Cell object in terms of the Board.
 * @returns {Number} The number of living neighbors the Cell has.
 */
Board.prototype.getLivingNeighbors = function (x, y) {
    // A reference to the cells array of the board.
    var cells = this.cells;

    // A reference to this cell.
    var currentCell = cells[x][y];

    // The height and width of the board.
    var height = this.height;
    var width = this.width;

    // An array to hold this cells alive neighbors.
    var aliveNeighbors = [];

    // The cell we are testing (changes to each neighbor).
    var cell;

    // The number of living neighbors this cell has.
    var countLiving = 0;

    // Check each cell surrounding the cell at the given
    // location and increment the counter based on the
    // "alive" status of each of those cells.

    // Check cell on the left.
    if (x !== 0) {
        cell = cells[x - 1][y];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the top left.
    if (x !== 0 && y !== 0) {
        cell = cells[x - 1][y - 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the top.
    if (y !== 0) {
        cell = cells[x][y - 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the top right.
    if (x !== width - 1 && y !== 0) {
        cell = cells[x + 1][y - 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the right.
    if (x !== width - 1) {
        cell = cells[x + 1][y];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the bottom right.
    if (x !== width - 1 && y !== height - 1) {
        cell = cells[x + 1][y + 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the bottom.
    if (y !== height - 1) {
        cell = cells[x][y + 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Check cell on the bottom left.
    if (x !== 0 && y !== height - 1) {
        cell = cells[x - 1][y + 1];
        if (cell.isAlive) {
            aliveNeighbors.push(cell);
        }
    }

    // Set the count equal to the length of the array
    // we just built.
    countLiving = aliveNeighbors.length;

    // If this cell is dead and has 3 alive neighbors,
    // then it is going to come to life so build the new
    // color from the 3 alive cells and set this cell's
    // color to it.
    if (!currentCell.isAlive && countLiving === 3) {
        currentCell.color = '#';
        for (var i = 0; i < countLiving; i++) {
            // Calculate the starting position to use for
            // the substr method.
            var substrIndex = i * 2 + 1;
            currentCell.color += aliveNeighbors[i].color.substr(substrIndex, 2);
        }
    }

    // Return the number of living neighbors.
    return countLiving;
};

/**
 * When a Cell on the board is clicked, toggle
 * the "alive" state of the Cell at the given
 * location on the board.
 *
 * @param {Number} x - The x-coordinate of the Cell in terms of the Board.
 * @param {Number} y - The y-coordinate of the Cell in terms of the Board.
 */
Board.prototype.clickCell = function(x, y) {
    this.cells[x][y].toggle();
};

// TODO: allow user to set width and height params.
// Create a new Board object.
var board = new Board(50, 30);
// Draw the initial state of the board (empty).
// We do this to get our nice grid overlay drawn.
board.draw();

var gameLoop = function () {
    if (running) {
        board.update();
        board.draw();
    }
};

var interval = setInterval(gameLoop, speed);

var modSpeed = function (newSpeed) {
    clearInterval(interval);
    interval = setInterval(gameLoop, newSpeed);
};

var fpsRange = document.getElementById('fps-slider');
fpsRange.addEventListener('change', function() {
    modSpeed(1000/fpsRange.value);
});
// Object to represent the Color Palette and have some
// helper methods for setting and getting the color.
var colorPalette = {
    chooseColor: function(id) {
        var currentChosenColorElem = document.getElementsByClassName('chosen');
        if (currentChosenColorElem[0]) {
            currentChosenColorElem[0].className = 'color-picker';
        }

        var chosenColor = document.getElementById(id);
        chosenColor.className = chosenColor.className + ' chosen';
    },
    getColor: function() {
        var currentChosenColorElem = document.getElementsByClassName('chosen');
        if (currentChosenColorElem[0]) {
            return currentChosenColorElem[0].value;
        }
    }
};
// Select the first color in the palette by default.
document.getElementById('color1-btn').click();

// INPUT -----------------------------------------------------------------------
// Add event handlers for various hot keys the user can use
// to interact with the applicaiton.
window.addEventListener('keydown', function(event){
    // Select the color from the color palette based on
    // which number the user presses (hot keys for the palette).
    // But ignore input if user is typing in width or height of the board.
    if ((document.getElementById('width') !== document.activeElement) &&
        (document.getElementById('height') !== document.activeElement)) {
        if (event.keyCode === 49 || event.keyCode === 97) {
            document.getElementById('color1-btn').click();
        } else if (event.keyCode === 50 || event.keyCode === 98) {
            document.getElementById('color2-btn').click();
        } else if (event.keyCode === 51 || event.keyCode === 99) {
            document.getElementById('color3-btn').click();
        } else if (event.keyCode === 52 || event.keyCode === 100) {
            document.getElementById('color4-btn').click();
        } else if (event.keyCode === 53 || event.keyCode === 101) {
            document.getElementById('color5-btn').click();
        } else if (event.keyCode === 54 || event.keyCode === 102) {
            document.getElementById('color6-btn').click();
        }
    }
}, false);

// Add event handler for the user clicking on the canvas (the board).
canvas.addEventListener('mousedown', function(event){
    // TODO: add compatibility for Firefox.
    var x = event.x - canvas.offsetLeft;
    var y = event.y - canvas.offsetTop;

    x /= CELL_SIZE;
    y /= CELL_SIZE;

    x = Math.floor(x);
    y = Math.floor(y);

    board.clickCell(x, y);
}, false);


// Helper functions ------------------------------------------------------------
// These are functions that help handle UI events.

// Plays and pauses the simulation when the user presses the Play/Pause button.
function togglePlay() {
    var playPauseBtn = document.getElementById('play-pause-btn');
    running = !running;

    if (running) {
        playPauseBtn.value = 'Pause';
    } else {
        playPauseBtn.value = 'Play';
    }
}

// Calls the board's clear method and pauses the simulation.
function clearBoard() {
    board.clear();
    pause();
}

function createBoard() {
    var width = Math.round(document.getElementById('width').value);
    var height = Math.round(document.getElementById('height').value);

    if (width < 1 || height < 1) {
        alert("Width & Height of board MUST be at least 1 cell unit.");
        return;
    }
    board = new Board(width, height);
    board.draw();

    pause();
}

// Pauses the simulation if it is running.
function pause() {
    if (running) {
        togglePlay();
    }
}
