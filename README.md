# Conway's Life: A JavaScript Implementation
An implementation of Conway's Game of Life in *pure* JavaScript with
added features: genetics and maturity. By pure, I mean no third-party libraries
are used (no jQuery, Angular, React, etc.).

## Game of Life Rules
For those that aren't familiar with **Conway's Game of Life**, it is a game, or
rather a simulation as it doesn't have any actual players, that demonstrates
various growth patterns.

The game consists of a board of some width and height which is made up of cells.
Each cell can be in one of two states: **alive** or **dead**. As time moves on,
these cells' states can change depending on the rules of the game, causing
interesting patterns to arise.

The rules for the game are as follows:
- Any live cell with fewer than two live neighbors dies, as if caused by
under population.
- Any live cell with two or three live neighbors lives on to the next generation.
- Any live cell with more than three live neighbors dies, as if caused by
overcrowding.
- Any dead cell with exactly three live neighbors becomes a live cell, as if by
reproduction.

---

## Genetics
To simulate genetics, each cell will have a color. The cells in the initial seed
will all have their colors chosen by the user. Cells that come to life after
the initial seed will inherit their color from their three parents.
- Red Value: from the left most parent
- Green Value: from the next parent (moving clockwise)
- Blue Value: from the last parent (the right most parent)

---

## Maturity
Each cell will have a "maturity" value that will be represented by its opacity.
Each cell when it first comes to life (including the original seed cells) will
have an opacity value of 0.1. When a cell lives on to the next generation, its
opacity value is increased by 0.1 (with a maximum of 1).

If a cell reaches full maturity, its opacity value remains at 1 until it dies.
Anytime a cell dies, its opacity rating is reset to 0.1 and it must mature again
if it comes back to life.
