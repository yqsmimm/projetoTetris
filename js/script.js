document.addEventListener("DOMContentLoaded", () => {
  const width = 10;
  const heigth = 20;
  const size = width * heigth;
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-btn");
  const grid = createGrid();
  const squares = Array.from(grid.querySelectorAll(".square"));
  const activeKeys = {}; // armazena quais teclas estão pressionadas (true ou false)
  let movementIntervals = {}; // armazena os ids de setInterval de cada tecla (para parar depois)
  let dasTimeouts = {}; // armazena os ids de setTimeout de cada tecla (para o atraso inicial)
  const DAS = 200; // delay antes do movimento contínuo (ms) -> DAS - Delayed Auto Shift
  const ARR = 100; // velocidade do movimento contínuo (ms) -> ARR - Auto Repeat Rate

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

  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  //assign functions to keyCodes
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

  // quando uma tecla é pressionada
  document.addEventListener("keydown", (e) => {
    const key = e.key; // obtém a tecla pressionada

    if (activeKeys[key]) return; // se já está pressionado, ignora (evita múltiplos timeouts/intervals)
    activeKeys[key] = true;

    if (key === "ArrowUp") {
      rotate(); // rotação é só uma vez
      return;
    }

    movement(key); // executa o movimento 

    // inicia um atraso (DAS) e dps começa a repetir (ARR)
    dasTimeouts[key] = setTimeout(() => {
      movementIntervals[key] = setInterval(() => {
        movement(key);
      }, ARR); // executa a cada 100ms
    }, DAS); // espera 200ms antes de começar
  });

  // quando uma tecla é solta 
  document.addEventListener("keyup", (e) => {
    const key = e.key; // obtém qual tecla foi solta

    activeKeys[key] = false; // marca a tecla como não ativa

    clearTimeout(dasTimeouts[key]); // // cancela o timeout, se ainda esteja aguardando
    clearInterval(movementIntervals[key]); // cancela o movimento contínuo, caso tenha começado

    // remove os registros de timeout/interval da tecla
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
      currentPosition = 4;
      draw();
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

  //rotate tetromino
  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = allTetrominoes[random][currentRotation];
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );

    if (isAtRightEdge && isAtLeftEdge) {
      currentPosition -= 1;
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }


  setTimeout(() => {
    draw();
    timerID = setInterval(moveDown, 1000);
  }, 50);
});
