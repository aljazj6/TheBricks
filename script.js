const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width, HEIGHT = canvas.height;

    const meteorImg = new Image();
    meteorImg.src = "img/meteor.png";
    const meteorRadius = 32;

    const shipImg = new Image();
    shipImg.src = "img/spaceship.png";
    const shipW = 70, shipH = 70;

    let x, y, dx, dy;
    let shipX = (WIDTH - shipW) / 2;
    let rightDown = false, leftDown = false;
    let gameRunning = false, intervalId = null;
    let startTime = 0, elapsedTime = 0;

    const rowCount = 4, colCount = 8;
    const turretW = WIDTH / colCount;
    const turretH = HEIGHT / 16;  // <<<<< Spremenil višino turreta
    const turretOffsetTop = 0;    // <<<<< Turreti začnejo pri samem vrhu
    const turretPadding = 0;

    let turrets = [];

    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const resetBtn = document.getElementById("resetBtn");
    const difficultySelect = document.getElementById("difficulty");

    document.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") rightDown = true;
      if (e.key === "ArrowLeft") leftDown = true;
    });
    document.addEventListener("keyup", e => {
      if (e.key === "ArrowRight") rightDown = false;
      if (e.key === "ArrowLeft") leftDown = false;
    });

    function initTurrets() {
      turrets = [];
      for (let r = 0; r < rowCount; r++) {
        turrets[r] = [];
        for (let c = 0; c < colCount; c++) {
          turrets[r][c] = { x: 0, y: 0, status: 1 };
        }
      }
    }

    function drawTurrets() {
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          const t = turrets[r][c];
          if (t.status) {
            const tx = c * (turretW + turretPadding);
            const ty = turretOffsetTop + r * (turretH + turretPadding);
            t.x = tx; t.y = ty;
            ctx.beginPath();
            ctx.rect(tx, ty, turretW, turretH);
            ctx.fillStyle = "#00ffff"; ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = "#ccefff"; ctx.stroke();
          }
        }
      }
    }

    function collisionDetection() {
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          const t = turrets[r][c];
          if (t.status && x > t.x && x < t.x + turretW && y > t.y && y < t.y + turretH) {
            dy = -dy;
            t.status = 0;
            document.getElementById("impactSound").cloneNode(true).play();
          }
        }
      }
    }

    function draw() {
      if (!gameRunning) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      elapsedTime = (Date.now() - startTime) / 1000;
      document.getElementById("timerDisplay").textContent = "Time: " + elapsedTime.toFixed(2) + "s";

      drawTurrets();

      ctx.drawImage(meteorImg, x - meteorRadius, y - meteorRadius, meteorRadius * 2, meteorRadius * 2);
      ctx.drawImage(shipImg, shipX, HEIGHT - shipH - 10, shipW, shipH);

      if (rightDown) shipX = Math.min(WIDTH - shipW, shipX + 6);
      if (leftDown) shipX = Math.max(0, shipX - 6);

      if (x + dx > WIDTH - meteorRadius || x + dx < meteorRadius) dx = -dx;
      if (y + dy < meteorRadius) dy = -dy;
      else if (y + dy > HEIGHT - shipH + 20 - meteorRadius) {
        if (x > shipX && x < shipX + shipW) {
          y = HEIGHT - shipH + 20 - meteorRadius;
          dy = -dy;
        } else {
          endGame(false);
          return;
        }
      }

      x += dx;
      y += dy;
      collisionDetection();

      if (turrets.flat().every(t => t.status === 0)) endGame(true);
    }

    function startGame() {
      clearInterval(intervalId);
      initTurrets();
      gameRunning = true;
      difficultySelect.disabled = true;

      shipX = (WIDTH - shipW) / 2;
      x = WIDTH / 2;
      y = HEIGHT - 60;

      const diff = difficultySelect.value;
      const speed = diff === "easy" ? 2 : diff === "medium" ? 3 : 4;
      dx = speed;
      dy = -speed;

      startTime = Date.now();
      intervalId = setInterval(draw, 16);

      startBtn.style.display = "none";
      stopBtn.style.display = "inline-block";
      resumeBtn.style.display = "none";
      resetBtn.style.display = "none";
    }

    function stopGame() {
      if (!gameRunning) return;
      clearInterval(intervalId);
      gameRunning = false;
      stopBtn.style.display = "none";
      resumeBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
    }

    function resumeGame() {
      if (gameRunning) return;
      startTime = Date.now() - (elapsedTime * 1000);
      intervalId = setInterval(draw, 16);
      gameRunning = true;
      resumeBtn.style.display = "none";
      resetBtn.style.display = "none";
      stopBtn.style.display = "inline-block";
    }

    function resetGame() {
      clearInterval(intervalId);
      gameRunning = false;
      difficultySelect.disabled = false;
      elapsedTime = 0;
      document.getElementById("timerDisplay").textContent = "Time: 0.00s";
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      startBtn.style.display = "inline-block";
      stopBtn.style.display = "none";
      resumeBtn.style.display = "none";
      resetBtn.style.display = "none";
    }

    function endGame(won) {
      stopGame();
      Swal.fire({
        title: won ? 'Victory!' : 'Game Over!',
        text: won ? 'All turrets destroyed!' : 'Meteor lost in the void.',
        icon: won ? 'success' : 'error',
        background: '#1e1b2c', color: '#f0e9ff',
        confirmButtonColor: '#6c4db2',
        customClass: { popup: 'swal2-rounded' }
      }).then(() => startGame());
    }

    function showInfo() {
      Swal.fire({
        title: 'Instructions',
        html: `<p>Destroy all turrets by bouncing the meteor.<br>Use ←/→ arrows to move your ship.</p>`,
        icon: 'info', background: '#1e1b2c',
        color: '#f0e9ff', confirmButtonColor: '#6c4db2',
        customClass: { popup: 'swal2-rounded' }
      });
    }