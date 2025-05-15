addEventListener("DOMContentLoaded", () => {
  const width = 10;
  const heigth = 20;
  const size = width * heigth;
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-btn");
  const grid = createGrid();
  const squares = Array.from(grid.querySelectorAll(".square"));

  function createGrid() {
    let grid = document.querySelector("div");
    for (let i = 0; i < size; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      grid.appendChild(square);
    }
    return grid;
  }

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2], // ou seja, células: (0,1), (1,1), (2,1), (0,2)
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const allTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4;
  let currentRotation = 0;
  let random = Math.floor(Math.random() * allTetrominoes.length);
  let current = allTetrominoes[random][currentRotation];

  //draw the tretomino
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  //undraw the tetromino
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  timerID = setInterval(moveDown, 1000); // <- move down every second

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
  }

  setTimeout(() => {
    draw();
    timerID = setInterval(moveDown, 1000);
  }, 50);
});
