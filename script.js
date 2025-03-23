
    /* Canvas setup */
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    /* Meteor slika (transparentna). Po potrebi zamenjaj s svojo lokalno. */
    const meteorImg = new Image();
    meteorImg.src = "img/meteor.png";
    const meteorRadius = 24; 

    /* Spaceship */
    const shipImg = new Image();
    shipImg.src = "img/spaceship.png";
    const shipW = 50;
    const shipH = 50;

    let x, y;  
    let dx, dy; 

    let gameRunning = false;
    let intervalId = null;

    /* Koordinata X ladje */
    let shipX = (WIDTH - shipW) / 2;
    let rightDown = false;
    let leftDown = false;

    /* Timer */
    let startTime = 0; 
    let elapsedTime = 0;

    /* “Bricks” => “Alien turrets” */
    const rowCount = 3;
    const colCount = 6;
    const turretW = WIDTH / colCount; 
    const turretH = 25;
    const turretOffsetTop = 40;
    const turretPadding = 0;
    let turrets = [];

    /* Gumbi in difficulty select */
    const startBtn  = document.getElementById("startBtn");
    const stopBtn   = document.getElementById("stopBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const resetBtn  = document.getElementById("resetBtn");
    const difficultySelect = document.getElementById("difficulty");

    /* Keyboard listeners */
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    function onKeyDown(e) {
      if (e.keyCode === 39) { 
        rightDown = true;
      } else if (e.keyCode === 37) {
        leftDown = true;
      }
    }
    function onKeyUp(e) {
      if (e.keyCode === 39) {
        rightDown = false;
      } else if (e.keyCode === 37) {
        leftDown = false;
      }
    }

    /* Inicializiramo turrets */
    function initTurrets() {
      turrets = [];
      for (let r = 0; r < rowCount; r++) {
        turrets[r] = [];
        for (let c = 0; c < colCount; c++) {
          turrets[r][c] = { x: 0, y: 0, status: 1 };
        }
      }
    }

    /* Trk meteorja s turreti */
    function collisionDetection() {
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          const t = turrets[r][c];
          if (t.status === 1) {
            if (
              x > t.x && x < t.x + turretW &&
              y > t.y && y < t.y + turretH
            ) {
              dy = -dy;
              t.status = 0;
            }
          }
        }
      }
    }

    /* Ali so vsi turreti uničeni? */
    function allTurretsDestroyed() {
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          if (turrets[r][c].status === 1) {
            return false;
          }
        }
      }
      return true;
    }

    /* Risanje turrets (cyan) */
    function drawTurrets() {
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          const t = turrets[r][c];
          if (t.status === 1) {
            const turretX = c * (turretW + turretPadding);
            const turretY = turretOffsetTop + r * (turretH + turretPadding);
            t.x = turretX;
            t.y = turretY;

            ctx.beginPath();
            ctx.rect(turretX, turretY, turretW, turretH);
            ctx.closePath();
            ctx.fillStyle = "#00ffff";
            ctx.fill();
            ctx.strokeStyle = "#ccefff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    }

    /* Glavna risalna zanka */
    function draw() {
      if (!gameRunning) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Timer
      elapsedTime = (Date.now() - startTime) / 1000;
      document.getElementById("timerDisplay").textContent = 
        "Time: " + elapsedTime.toFixed(2) + "s";

      drawTurrets();

      // Meteor
      ctx.drawImage(
        meteorImg,
        x - meteorRadius,
        y - meteorRadius,
        meteorRadius * 2,
        meteorRadius * 2
      );

      // Ladja
      ctx.drawImage(shipImg, shipX, HEIGHT - shipH, shipW, shipH);

      // Premik ladje
      if (rightDown) {
        shipX += 5;
        if (shipX + shipW > WIDTH) {
          shipX = WIDTH - shipW;
        }
      } else if (leftDown) {
        shipX -= 5;
        if (shipX < 0) {
          shipX = 0;
        }
      }

      // Odbijanje meteorja
      if (x + dx > WIDTH - meteorRadius || x + dx < meteorRadius) {
        dx = -dx;
      }
      if (y + dy < meteorRadius) {
        dy = -dy;
      } else if (y + dy > HEIGHT - meteorRadius) {
        if (x > shipX && x < shipX + shipW) {
          dy = -dy;
        } else {
          endGame(false);
          return;
        }
      }

      x += dx;
      y += dy;

      collisionDetection();

      if (allTurretsDestroyed()) {
        endGame(true);
      }
    }

    /* Zaključek igre */
    function endGame(won) {
  stopGame();
  if (won) {
    Swal.fire({
      title: '🚀 Victory!',
      text: 'You’ve obliterated all alien turrets. The galaxy is safe… for now.',
      icon: 'success',
      confirmButtonText: 'Play Again',
      background: '#1e1b2c',          // temna vijolično-modra
      color: '#d8d8f6',               // svetla futuristična pisava
      confirmButtonColor: '#4e39a0',  // gumb barva: elegantna vijolična
      customClass: {
        popup: 'swal2-rounded'
      }
    }).then(() => {
      startGame();
    });
  } else {
    Swal.fire({
      title: 'Game Over!',
      text: 'The meteor got lost the void.',
      icon: 'error',
      confirmButtonText: 'Try-again',
      background: '#1e1b2c',          // temna tema z roza-vijoličnim odtenkom
      color: '#f0e9ff',               // mehka svetla pisava
      confirmButtonColor: '#6c4db2',  // gumb barva: vesoljska vijolična
      customClass: {
        popup: 'swal2-rounded'
      }
    }).then(() => {
      startGame();
    });
  }
}



    /* Start Game */
    function startGame() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      gameRunning = true;
      initTurrets();

      difficultySelect.disabled = true;

      x = WIDTH / 2;
      y = HEIGHT - 40;
      shipX = (WIDTH - shipW) / 2;

      const diff = difficultySelect.value;
      if (diff === "easy") {
        dx = 2; 
        dy = -2;
      } else if (diff === "medium") {
        dx = 3; 
        dy = -3;
      } else if (diff === "hard") {
        dx = 4; 
        dy = -4;
      }

      startTime = Date.now();
      intervalId = setInterval(draw, 16);

      startBtn.style.display  = "none";
      stopBtn.style.display   = "inline-block";
      resumeBtn.style.display = "none";
      resetBtn.style.display  = "none";
    }

    /* Stop Game */
    function stopGame() {
      if (!gameRunning) return;
      gameRunning = false;
      clearInterval(intervalId);

      stopBtn.style.display   = "none";
      resumeBtn.style.display = "inline-block";
      resetBtn.style.display  = "inline-block";
    }

    /* Resume Game */
    function resumeGame() {
      if (gameRunning) return;
      gameRunning = true;

      startTime = Date.now() - (elapsedTime * 1000);
      intervalId = setInterval(draw, 16);

      resumeBtn.style.display = "none";
      resetBtn.style.display  = "none";
      stopBtn.style.display   = "inline-block";
    }

    /* Reset Game */
    function resetGame() {
      gameRunning = false;
      clearInterval(intervalId);

      elapsedTime = 0;
      document.getElementById("timerDisplay").textContent = "Time: 0.00s";

      difficultySelect.disabled = false;

      initTurrets();

      x = WIDTH / 2;
      y = HEIGHT - 40;
      dx = 0;
      dy = 0;
      shipX = (WIDTH - shipW) / 2;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawTurrets();
      ctx.drawImage(meteorImg, x - meteorRadius, y - meteorRadius, meteorRadius*2, meteorRadius*2);
      ctx.drawImage(shipImg, shipX, HEIGHT - shipH, shipW, shipH);

      startBtn.style.display  = "inline-block";
      stopBtn.style.display   = "none";
      resumeBtn.style.display = "none";
      resetBtn.style.display  = "none";
    }
