
// Cell size in pixels. Cells are squares so we only need
// to specify one value (it is used for length and width).
var CELL_SIZE = 12;
var FPS = 10;
var running = false;

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// Cell constructor function
function Cell (x, y) {
    this.x = x;
    this.y = y;
    this.isAlive = false;
}

Cell.prototype.draw = function () {
    if (this.isAlive) {
        context.fillStyle = "black";
    } else {
        context.fillStyle = "white";
    }

    context.fillRect(this.x * CELL_SIZE,
                        this.y * CELL_SIZE,
                        CELL_SIZE,
                        CELL_SIZE);
};

Cell.prototype.toggle = function () {
    console.log("TOGGLE!");
    this.isAlive = !this.isAlive;
    //this.draw();
};

// Board constructor function
function Board(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.next = [];

    // Convert the width & height of the board to be
    // in terms of pixels and set those values to
    // the width & height of the canvas, respectively.
    // TODO: this should be moved elsewhere really
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
 * Clears the board with dead cells.
 */
Board.prototype.clear = function () {
    console.log("clear board");
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.cells[x][y].isAlive = false;
        }
    }
};

// TODO: draw functions should have a reference to the context?
// i.e. function(ctx)?
Board.prototype.draw = function () {
    // clear the canvas
    //context.clearRect(0, 0, canvas.width, canvas.height);
    var xPos;
    var yPos;
    var widthPx = this.width * CELL_SIZE;
    var heightPx = this.height * CELL_SIZE;
    context.beginPath();

    // TODO: move drawing code to two functions?
    // drawCells and drawGridlines?

    // For every cell on the board...
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // Draw the cell.
            this.cells[x][y].draw();

            // Draw grid line
            xPos = x * CELL_SIZE;
            context.moveTo(xPos, 0);
            context.lineTo(xPos, heightPx);

            yPos = y * CELL_SIZE;
            context.moveTo(0, yPos);
            context.lineTo(widthPx, yPos);
        }
    }

    context.moveTo(widthPx, 0);
    context.lineTo(widthPx, heightPx);

    context.moveTo(0, heightPx);
    context.lineTo(widthPx, heightPx);

    context.strokeStyle = "#333";
    context.stroke();
};

Board.prototype.update = function () {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.next[x][y] = this.cells[x][y].isAlive &&
                              this.getLivingNeighbors(x, y) === 2 ||
                              this.getLivingNeighbors(x, y) === 3;
        }
    }
    
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.cells[x][y].isAlive = this.next[x][y];
        }
    }
};

Board.prototype.getLivingNeighbors = function (x, y) {
    var count = 0;
    var cells = this.cells;

    // Check cell on the right.
    if (x !== this.width - 1)
        if (cells[x + 1][y].isAlive)
            count++;

    // Check cell on the bottom right.
    if (x !== this.width - 1 && y !== this.height - 1)
        if (cells[x + 1][y + 1].isAlive)
            count++;

    // Check cell on the bottom.
    if (y !== this.height - 1)
        if (cells[x][y + 1].isAlive)
            count++;

    // Check cell on the bottom left.
    if (x !== 0 && y !== this.height - 1)
        if (cells[x - 1][y + 1].isAlive)
            count++;

    // Check cell on the left.
    if (x !== 0)
        if (cells[x - 1][y].isAlive)
            count++;

    // Check cell on the top left.
    if (x !== 0 && y !== 0)
        if (cells[x - 1][y - 1].isAlive)
            count++;

    // Check cell on the top.
    if (y !== 0)
        if (cells[x][y - 1].isAlive)
            count++;

    // Check cell on the top right.
    if (x !== this.width - 1 && y !== 0)
        if (cells[x + 1][y - 1].isAlive)
            count++;

    return count;
};

Board.prototype.clickCell = function(x, y) {
    this.cells[x][y].toggle();
}

// TODO: allow user to set width and height params.
var board = new Board(50, 30);
//board.draw();

// Update the board every half second
// TODO: control how often the board gets updated.
// Slider to change FPS?
setInterval(function() {
    // Draw the current state of the board.
    board.draw();  
    
    // Update the board if the game is running
    if (running) {
        // Update the state of the board.
        board.update(); 
    }
            
}, 1000/FPS);

// Input
window.addEventListener('keydown', function(event){
    if (event.keyCode === 32) {
        running = !running;
    }
}, false);

// function getPosition(event) {
//     var x = event.x;
//     var y = event.y;
//
//     x -= canvas.offsetLeft;
//     y -= canvas.offsetTop;
//
//     x /= CELL_SIZE;
//     y /= CELL_SIZE;
//     // check if this position "collides" with a cell.
//     // i.e. did the user click a cell
//     console.log(board.cells);
//     board.clickCell(x, y);
//
//     console.log("x: %d, y: %d", x, y);
// }

canvas.addEventListener('mousedown', function(event){
    var x = event.x - canvas.offsetLeft;
    var y = event.y - canvas.offsetTop;
    
    x /= CELL_SIZE;
    y /= CELL_SIZE;
    
    x = Math.floor(x);
    y = Math.floor(y);
    
    board.clickCell(x, y);
}, false);

