document.addEventListener("DOMContentLoaded", () => {
  const width = 10;
  const heigth = 20;
  const size = width * heigth;
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-btn");
  const grid = createGrid();
  const squares = Array.from(grid.querySelectorAll(".square"));
  const activeKeys = {};
  let movementIntervals = {};
  let dasTimeouts = {};
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
      random = Math.floor(Math.random() * allTetrominoes.length);
      currentRotation = 0;
      current = allTetrominoes[random][currentRotation];
      currentType = getTetrominoType(random);
      currentPosition = 4;
      draw();
      if (
        current.some((index) =>
          squares[currentPosition + index].classList.contains("taken")
        )
      ) {
        alert("Game Over");
        clearInterval(timerID);
      }
    }
  }

  //move tetromino left
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

  //move tetromino right
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

  setTimeout(() => {
    draw();
    timerID = setInterval(moveDown, 1000);
  }, 50);
});
