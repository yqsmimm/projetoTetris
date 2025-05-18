document.addEventListener("DOMContentLoaded", () => {
  const width = 10;
  const height = 20;
  const size = width * height;
  let nextRandom = 0;
  let timerID = null;
  let score = 0;
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-btn");
  const grid = createGrid();
  createMiniGrid();
  let squares = Array.from(grid.querySelectorAll(".square"));
  const activeKeys = {};
  let movementIntervals = {};
  let dasTimeouts = {};
  let gameStarted = false;
  const DAS = 200;
  const ARR = 100;

  function createGrid() {
    let grid = document.querySelector(".grid");
    for (let i = 0; i < size; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      grid.appendChild(square);
    }
    return grid;
  }

  function createMiniGrid() {
    const miniGrid = document.querySelector(".mini-grid");
    for (let i = 0; i < 16; i++) {
      const miniSquare = document.createElement("div");
      miniGrid.appendChild(miniSquare);
    }
  }

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
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
  let currentType = getTetrominoType(random);

  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino", currentType);
    });
  }

  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove(
        "tetromino",
        currentType
      );
    });
  }

  function getTetrominoType(index) {
    return ["l", "z", "t", "o", "i"][index];
  }

  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }

  function movement(key) {
    switch (key) {
      case "ArrowLeft":
        moveLeft();
        break;
      case "ArrowRight":
        moveRight();
        break;
      case "ArrowDown":
        moveDown();
        break;
    }
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (activeKeys[key]) return;
    activeKeys[key] = true;

    if (key === "ArrowUp") {
      rotate();
      return;
    }

    movement(key);

    dasTimeouts[key] = setTimeout(() => {
      movementIntervals[key] = setInterval(() => {
        movement(key);
      }, ARR);
    }, DAS);
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key;

    activeKeys[key] = false;

    clearTimeout(dasTimeouts[key]);
    clearInterval(movementIntervals[key]);

    delete dasTimeouts[key];
    delete movementIntervals[key];
  });

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    const reachedBottom = current.some(
      (index) => currentPosition + index + width >= size
    );

    const nextRowTaken = current.some(
      (index) =>
        squares[currentPosition + index + width] &&
        squares[currentPosition + index + width].classList.contains("taken")
    );

    if (reachedBottom || nextRowTaken) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
      );
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * allTetrominoes.length);
      currentRotation = 0;
      current = allTetrominoes[random][currentRotation];
      currentType = getTetrominoType(random);
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      if (
        gameStarted &&
        current.some((index) =>
          squares[currentPosition + index].classList.contains("taken")
        )
      ) {
        clearInterval(timerID);
        showGameOver();
      }
    }
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );
    if (!isAtLeftEdge) currentPosition -= 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );
    if (!isAtRightEdge) currentPosition += 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition -= 1;
    }
    draw();
  }

  function previousRotation() {
    if (currentRotation === 0) {
      currentRotation = allTetrominoes[random].length - 1;
    } else {
      currentRotation--;
    }
    current = allTetrominoes[random][currentRotation];
  }

  function rotate() {
    undraw();
    currentRotation = (currentRotation + 1) % allTetrominoes[random].length;
    current = allTetrominoes[random][currentRotation];

    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );
    if (isAtLeftEdge && isAtRightEdge) {
      previousRotation();
    }

    const isFilled = current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    );
    if (isFilled) {
      previousRotation();
    }
    draw();
  }

  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  let displayIndex = 0;

  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ];

  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino", "l", "z", "t", "o", "i");
    });
    const nextType = getTetrominoType(nextRandom);
    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino", nextType);
    });
  }

  startBtn.addEventListener("click", () => {
    if (timerID) {
      clearInterval(timerID);
      timerID = null;
    } else {
      gameStarted = true;
      draw();
      displayShape();
      timerID = setInterval(moveDown, 1000);
    }
  });

  document.querySelector("#restart-btn").addEventListener("click", () => {
    location.reload();
  });

  document
    .querySelector("#game-over-restart-btn")
    .addEventListener("click", () => {
      document.getElementById("game-over").classList.add("hidden");
      location.reload();
    });

  document.querySelector("#restart-btn").addEventListener("click", () => {
    location.reload();
  });

  function showGameOver() {
    document.getElementById("game-over").classList.remove("hidden");
  }

  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
        });
        row.forEach((index) => {
          squares[index].classList.remove(
            "taken",
            "tetromino",
            "l",
            "z",
            "t",
            "o",
            "i"
          );
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }
});
