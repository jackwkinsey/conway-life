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

/** The frames per second in which the simulation should run. */
var fps = 1;

/** The speed of the simulation. */
var speed = 1000/fps;

/** Flag to determine if game is running, false by default. */
var running = false;

/** The canvas where all our drawing takes place. */
var canvas = document.getElementById('canvas');

/** The 2D context of the canvas to handle the draw calls. */
var context = canvas.getContext('2d');

/** Reference to the board. */
var board;

/**
 * Model for cell object.
 *
 * @constructor
 * @param {Number} x - The x-coordinate of the cell in terms of the board.
 * @param {Number} y - The y-coordinate of the cell in terms of the board.
 */
function Cell (x, y, color) {
    this.x = x;
    this.y = y;
    this.isAlive = false;
    this.maturity = 0.1;
    this.color = color || '#000000';
}

/**
 * Draws the cell object on the canvas.
 */
Cell.prototype.draw = function () {
    // Clear the rectangle that encloses this cell (but making sure it
    // is smaller than the grid lines so those don't get cleared).
    context.clearRect(this.x * CELL_SIZE + 1,
                      this.y * CELL_SIZE + 1,
                      CELL_SIZE - 2,
                      CELL_SIZE - 2 );

    // Draw this cell if it is alive.
    if (this.isAlive) {
        // Set alpha value to the cell's maturity value.
        context.globalAlpha = this.maturity;

        // Color the cell using its color value.
        context.fillStyle = this.color;

        // Begin the draw path
        context.beginPath();

        // Draw an arc with the center point at the center of this cell,
        // and a radius slightly smaller than the CELL_SIZE (so it fits
        // nicely in the grid).
        context.arc((this.x * CELL_SIZE) + CELL_SIZE / 2,
                    (this.y * CELL_SIZE) + CELL_SIZE / 2,
                    CELL_SIZE / 2 - 2,
                    0, 2 * Math.PI);

        // Close the path to finish the circle.
        context.closePath();

        // Fill the circle with the cell's color.
        context.fill();

        // Set the styling & draw the outline of the cell.
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();
    }

    // Set global alpha back to 1 so everything else is drawn correctly.
    context.globalAlpha = 1;
};

/**
 * Toggle's the cell object; killing it if it is
 * alive or resurrecting it if it is dead.
 */
Cell.prototype.toggle = function () {
    // Get the currently chosen color.
    var color = colorPalette.getColor();

    // If the cell the user clicked is alive...
    if (this.isAlive) {
        // ...and if it is the same color as the chosen color...
        if (this.color === color) {
            // ...then kill it.
            this.kill();
        } else {
            // Otherwise, change the color to the chosen color.
            this.color = color;
        }
    } else {
        // Otherwise, bring the cell to life and make it the
        // same color as the chosen color.
        this.isAlive = true;
        this.color = color;
    }

    // Immediately draw this cell instead of waiting on the board
    // to do so, this helps the app feel more responsive to user input.
    this.draw();
};

/**
 * Kills the cell object.
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
 * Model for board object. The game's board in which the
 * cell objects live.
 *
 * @constructor
 * @param {Number} width - The width, in cells, of the game board.
 * @param {Number} height - The height, in cells, of the game board.
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

    // Initialize the board.
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
 * Clears the board with dead cells by traversing it and
 * killing each cell.
 */
Board.prototype.clear = function () {
    console.log("clear board");
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.cells[x][y].kill();
        }
    }
};

/**
 * Draws the current state of the board object by traversing
 * the board and drawing each cell object.
 */
Board.prototype.draw = function () {
    // Width and Height of board in pixels.
    var widthPx = this.width * CELL_SIZE;
    var heightPx = this.height * CELL_SIZE;

    // Clear the canvas.
    context.clearRect(0, 0, widthPx, heightPx);

    // Draw the cells and the grid overlay.
    this.drawCells();
    this.drawGrid(widthPx, heightPx);
};

/**
 * Function to draw all of the board's cells.
 */
Board.prototype.drawCells = function () {
    // For every cell on the board...
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // Draw the cell.
            this.cells[x][y].draw();
        }
    }
};

Board.prototype.drawGrid = function (width, height) {
    // Draw the vertical lines.
    for (var x = 0; x < this.width; x++) {
        var xPos = x * CELL_SIZE;
        context.beginPath();
        context.moveTo(xPos, 0);
        context.lineTo(xPos, height);
        context.closePath();
        context.strokeStyle = '#ddd';
        context.stroke();
    }

    // Draw the horizontal lines.
    for (var y = 0; y < this.height; y++) {
        var yPos = y * CELL_SIZE;
        context.beginPath();
        context.moveTo(0, yPos);
        context.lineTo(width, yPos);
        context.closePath();
        context.strokeStyle = '#ddd';
        context.stroke();
    }
};

/**
 * Updates the state of each cell object for the board.
 */
Board.prototype.update = function () {
    // Determine the state of the next generation of each
    // cell object on the board.
    this.findNext();


    // Use the state of the next generation to affect each
    // cell object on the board.
    this.applyNext();
};

Board.prototype.findNext = function () {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.next[x][y] = this.cells[x][y].isAlive &&
                              this.getLivingNeighbors(x, y) === 2 ||
                              this.getLivingNeighbors(x, y) === 3;
        }
    }
};

Board.prototype.applyNext = function () {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // The current cell
            var cell = this.cells[x][y];

            // The "alive" status of this cell in the next generation.
            var aliveNextGen = this.next[x][y];

            // If this cell is currently alive and it is
            // still alive next generation
            if (cell.isAlive && aliveNextGen) {
                // then increment this cell's maturity if it isn't
                // already at the maximum of 1
                if (cell.maturity < 1)
                    cell.maturity += 0.1;
            } else if (cell.isAlive && !aliveNextGen) {
                // Otherwise, if this cell is currently alive and
                // it is not alive next generation, kill it.
                cell.kill();
            } else if (!cell.isAlive && aliveNextGen) {
                // Otherwise, if this cell is currently dead and
                // is is alive next generation, bring it to life;
                cell.isAlive = true;
            }
        }
    }
};

/**
 * Retrieves the number of living cell objects surrounding
 * the cell at the given location, and applies a new color
 * to the cell at the given location if appropriate.
 *
 * @param {Number} x - The x-coordinate of the cell object in terms of the board.
 * @param {Number} y - The y-coordinate of the cell object in terms of the board.
 * @returns {Number} The number of living neighbors the cell has.
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
 * When a cell on the board is clicked, toggle
 * the "alive" state of the cell at the given
 * location on the board.
 *
 * @param {Number} x - The x-coordinate of the cell in terms of the board.
 * @param {Number} y - The y-coordinate of the cell in terms of the board.
 */
Board.prototype.clickCell = function(x, y) {
    this.cells[x][y].toggle();
};

// Object to represent the Color Palette and have some
// helper methods for setting and getting the color.
var colorPalette = {
    // Choose a color (highlight the chosen one).
    chooseColor: function(id) {
        // Clear class style from current chosen color.
        var currentChosenColorElem = document.getElementsByClassName('chosen');
        if (currentChosenColorElem[0]) {
            currentChosenColorElem[0].className = 'color-picker';
        }

        // Get the new chosen color and give it class 'chosen'
        // to help it stand out as selected.
        var chosenColor = document.getElementById(id);
        chosenColor.className = chosenColor.className + ' chosen';
    },

    // Finds the color selector with class 'chosen' and returns its value.
    getColor: function() {
        var currentChosenColorElem = document.getElementsByClassName('chosen');
        if (currentChosenColorElem[0]) {
            return currentChosenColorElem[0].value;
        }
    }
};

// Function to create a new board and draw it.
init = function() {
    board = new Board(
        Math.round(document.getElementById('width').value),
        Math.round(document.getElementById('height').value));

    // Draw the initial state of the board (empty).
    // We do this to get our nice grid overlay drawn.
    board.draw();

    // Select the first color in the palette by default.
    document.getElementById('color1-btn').click();
}();

// Set up the game loop
var gameLoop = function () {
    if (running) {
        board.update();
        board.draw();
    }
};

// Set up the interval for running the game loop.
var interval = setInterval(gameLoop, speed);

// INPUT -----------------------------------------------------------------------
// Add event handlers for various hot keys the user can use
// to interact with the applicaiton.
window.addEventListener('keydown', function(event){
    // Select the color from the color palette based on
    // which number the user presses (hot keys for the palette).
    // But ignore input if user is typing in width or height of the board.
    if ((document.getElementById('width') !== document.activeElement) &&
        (document.getElementById('height') !== document.activeElement)) {
        switch (event.keyCode) {
            case 49:
            case 97:
                document.getElementById('color1-btn').click();
                break;
            case 50:
            case 98:
                document.getElementById('color2-btn').click();
                break;
            case 51:
            case 99:
                document.getElementById('color3-btn').click();
                break;
            case 52:
            case 100:
                document.getElementById('color4-btn').click();
                break;
            case 53:
            case 101:
                document.getElementById('color5-btn').click();
                break;
            case 54:
            case 102:
                document.getElementById('color6-btn').click();
        }
    }
}, false);

// Add event handler for the user clicking on the canvas (the board).
canvas.addEventListener('mousedown', function(event){
    var bounds = canvas.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;

    x /= CELL_SIZE;
    y /= CELL_SIZE;

    x = Math.floor(x);
    y = Math.floor(y);

    board.clickCell(x, y);
}, false);

// A reference to the fps slider control.
var fpsRange = document.getElementById('fps-slider');

// When the slider changes, modify the interval for the game
// loop to increase or decrease the speed of the simulation.
fpsRange.addEventListener('change', function() {
    clearInterval(interval);
    interval = setInterval(gameLoop, 1000 / fpsRange.value);
});


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
