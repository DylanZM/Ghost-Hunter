let ghosts = [];
let flashes = [];
let stars = [];
let tombstones = [];
let pumpkins = [];
let bats = [];

let moonImg;
let ghostImg;
let bossImg;
let beamImg;
let batImgs = [];
let pumpkinImgs = [];
let tombImgs = [];

let score = 0;
let lives = 5;
let gameOver = false;
let gamePaused = false;

let currentWave = 1;
let ghostsToSpawn = 10;
let spawnInterval = 1500;
let lastGhostTime = 0;
let waveTextTimer = 120;

let currentBoss = null;

function preload() {
  moonImg = loadImage('assets/moon.png');
  ghostImg = loadImage('assets/ghost.png');
  bossImg = loadImage('assets/boss_king.png');
  beamImg = loadImage('assets/beam.png');

  for (let i = 0; i < 8; i++) {
    batImgs.push(loadImage('assets/bat' + i + '.png'));
  }

  for (let i = 1; i <= 5; i++) {
    pumpkinImgs.push(loadImage('assets/pumpkin' + i + '.png'));
  }

  tombImgs.push(
    loadImage('assets/tomb_grave.png'),
    loadImage('assets/tomb_grave2.png'),
    loadImage('assets/tomb_cross0.png'),
    loadImage('assets/tomb_cross1.png'),
    loadImage('assets/tomb_cross2.png'),
    loadImage('assets/tomb_cross3.png')
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < 40; i++) {
    stars.push({ x: random(width), y: random(height * 0.6), size: random(1, 2.5), brightness: random(100, 255) });
  }

  let tombstoneCount = Math.floor(width / 120);
  for (let i = 0; i < tombstoneCount; i++) {
    tombstones.push({
      x: random(i * 120 + 20, (i + 1) * 120 - 20),
      size: random(28, 40),
      img: random(tombImgs),
      flip: random(1) > 0.5
    });
  }

  for (let i = 0; i < 4; i++) {
    pumpkins.push({
      x: random(50, width - 50),
      size: random(25, 35),
      img: random(pumpkinImgs)
    });
  }

  for (let i = 0; i < 6; i++) {
    let speed = random(0.7, 1.6);
    if (random(1) > 0.5) speed *= -1;

    bats.push({
      x: random(width),
      y: random(60, min(height * 0.5, 340)),
      speed: speed,
      size: random(26, 42),
      frame: floor(random(batImgs.length)),
      frameTimer: floor(random(5))
    });
  }
}

function draw() {
  if (gameOver) {
    showGameOverScreen();
    return;
  }

  if (!gamePaused) {
    updateGame();
  }

  renderEverything();
}

function updateGame() {
  let currentTime = millis();

  if (currentWave % 5 === 0) {
    if (!currentBoss && ghostsToSpawn > 0 && waveTextTimer <= 0) {
      currentBoss = new Boss(currentWave);
      ghostsToSpawn = 0;
    }

    if (currentBoss) {
      currentBoss.update(currentTime);
      if (currentBoss.hp <= 0) {
        score += 100 * (currentWave / 5);
        currentBoss = null;
        nextWave();
      }
    }
  } else {
    if (ghostsToSpawn > 0 && currentTime - lastGhostTime > spawnInterval && waveTextTimer <= 0) {
      ghosts.push(new Ghost(currentWave, false));
      ghostsToSpawn--;
      lastGhostTime = currentTime;
    }

    if (ghostsToSpawn === 0 && ghosts.length === 0) {
      nextWave();
    }
  }

  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].alpha -= 25;
    if (flashes[i].alpha <= 0) flashes.splice(i, 1);
  }

  for (let b of bats) {
    b.x += b.speed;
    b.frameTimer++;
    if (b.frameTimer >= 5) {
      b.frameTimer = 0;
      b.frame = (b.frame + 1) % batImgs.length;
    }

    if (b.x > width + 60 || b.x < -60) {
      b.x = b.speed > 0 ? -60 : width + 60;
      b.y = random(60, min(height * 0.5, 340));
    }
  }

  for (let i = ghosts.length - 1; i >= 0; i--) {
    ghosts[i].update();
    if (ghosts[i].y > height - 40) {
      lives--;
      ghosts.splice(i, 1);
      if (lives <= 0) gameOver = true;
    }
  }
}

function renderEverything() {
  background(25, 10, 45);
  imageMode(CENTER);
  drawingContext.imageSmoothingEnabled = false;

  for (let s of stars) {
    fill(255, 255, 200, s.brightness);
    if (random(1) > 0.96) s.brightness = random(100, 255);
    noStroke();
    circle(s.x, s.y, s.size);
  }

  fill(255, 140, 0, 20);
  circle(120, 120, 190);
  fill(255, 180, 50, 40);
  circle(120, 120, 165);
  image(moonImg, 120, 120, 150, 150);

  for (let b of bats) {
    push();
    translate(b.x, b.y);
    if (b.speed < 0) scale(-1, 1);
    image(batImgs[b.frame], 0, 0, b.size, b.size);
    pop();
  }

  for (let t of tombstones) {
    push();
    translate(t.x, height - 40 - t.size / 2);
    if (t.flip) scale(-1, 1);
    image(t.img, 0, 0, t.size, t.size);
    pop();
  }

  noStroke();
  fill(15, 20, 15);
  rect(0, height - 40, width, 40);

  stroke(50, 200, 100, 90);
  strokeWeight(3);
  line(0, height - 40, width, height - 40);

  noStroke();
  for (let p of pumpkins) {
    image(p.img, p.x, height - 40 - p.size / 2, p.size, p.size);
  }

  for (let f of flashes) {
    let d = dist(f.x1, f.y1, f.x2, f.y2);
    push();
    translate(f.x1, f.y1);
    rotate(atan2(f.y2 - f.y1, f.x2 - f.x1) + HALF_PI);
    tint(255, 255, 255, f.alpha);
    image(beamImg, 0, -d / 2, 34, d);
    pop();
  }
  noTint();

  if (currentBoss) {
    currentBoss.render();
  }

  for (let g of ghosts) {
    g.render();
  }
  noTint();

  if (waveTextTimer > 0 && !gamePaused) {
    textAlign(CENTER, CENTER);
    if (currentWave % 5 === 0) {
      fill(255, 30, 30, min(waveTextTimer * 5, 255));
      textSize(45);
      text("BOSS WAVE " + currentWave, width / 2, height / 2 - 20);
    } else {
      fill(255, 140, 0, min(waveTextTimer * 5, 255));
      textSize(40);
      text("WAVE " + currentWave, width / 2, height / 2 - 20);
    }
    waveTextTimer--;
  }

  if (gamePaused) {
    fill(10, 5, 20, 180);
    rect(0, 0, width, height);
    fill(255, 150, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("GAME PAUSED", width / 2, height / 2);
    textSize(16);
    fill(255);
    text("Press Space to resume", width / 2, height / 2 + 35);
  }

  renderUI();

  if (!gamePaused) {
    stroke(255, 120, 0);
    strokeWeight(2);
    noFill();
    circle(mouseX, mouseY, 26);
    line(mouseX - 15, mouseY, mouseX + 15, mouseY);
    line(mouseX, mouseY - 15, mouseX, mouseY + 25);
  }
}

function renderUI() {
  let uiX = width - 150;
  let uiY = 15;

  noStroke();
  fill(20, 10, 30, 230);
  rect(uiX, uiY, 135, 85, 6);
  stroke(255, 100, 0, 120);
  strokeWeight(1);
  noFill();
  rect(uiX, uiY, 135, 85, 6);

  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);

  text("PTS: " + score, uiX + 10, uiY + 12);
  text("WAVE: " + currentWave, uiX + 10, uiY + 34);
  text("HP: " + "+".repeat(max(0, lives)), uiX + 10, uiY + 56);
}

function keyPressed() {
  if (keyCode === 32 || key === 'p' || key === 'P') {
    if (!gameOver) {
      gamePaused = !gamePaused;
    }
  }
}

function mousePressed() {
  if (gameOver || gamePaused || waveTextTimer > 0) return;

  flashes.push({
    x1: width / 2,
    y1: height - 40,
    x2: mouseX,
    y2: mouseY,
    alpha: 255
  });

  if (currentBoss) {
    let dxn = (mouseX - currentBoss.x) / 55;
    let dyn = (mouseY - currentBoss.y) / 95;
    if (dxn * dxn + dyn * dyn < 1) {
      currentBoss.hp -= 10;
      score += 5;
      return;
    }
  }

  for (let i = ghosts.length - 1; i >= 0; i--) {
    let g = ghosts[i];
    let d = dist(mouseX, mouseY, g.x, g.y);

    if (d < g.size / 1.5) {
      score += g.isMinion ? 15 : 10;
      ghosts.splice(i, 1);
      break;
    }
  }
}

function nextWave() {
  currentWave++;
  waveTextTimer = 120;

  if (currentWave % 5 === 0) {
    ghostsToSpawn = 1;
  } else {
    ghostsToSpawn = 10 + currentWave * 2;
    spawnInterval = max(1500 - (currentWave * 150), 400);
  }
}

function showGameOverScreen() {
  fill(255, 80, 0);
  noStroke();
  textSize(42);
  textAlign(CENTER, CENTER);
  text("CEMETERY OVERRUN", width / 2, height / 2 - 30);
  fill(255);
  textSize(20);
  text("Reached Wave: " + currentWave, width / 2, height / 2 + 20);
  text("Final Score: " + score, width / 2, height / 2 + 50);
  textSize(14);
  fill(160, 140, 180);
  text("Press F5 to restart", width / 2, height / 2 + 105);
}

class Ghost {
  constructor(waveLevel, isMinion, posX = null, posY = null) {
    this.isMinion = isMinion;
    this.x = posX !== null ? posX : random(40, width - 40);
    this.y = posY !== null ? posY : -40;

    let minSpeed = 1.0 + (waveLevel * 0.25);
    let maxSpeed = 2.2 + (waveLevel * 0.35);

    this.speed = random(minSpeed, maxSpeed) * (isMinion ? 1.3 : 1.0);
    this.size = isMinion ? random(25, 35) : random(35, 50);
    this.oscillation = random(0, 100);

    if (isMinion) {
      this.r = 255; this.g = 130; this.b = 0;
    } else {
      this.r = 255; this.g = 255; this.b = 255;
    }
  }

  update() {
    this.y += this.speed;
    this.x += sin(this.oscillation) * (this.isMinion ? 2.2 : 1.2);
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.oscillation += 0.05;
  }

  render() {
    tint(this.r, this.g, this.b, 210);
    image(ghostImg, this.x, this.y, this.size, this.size);
  }
}

class Boss {
  constructor(waveLevel) {
    this.x = width / 2;
    this.y = -100;
    this.targetY = 135;
    this.size = 130;

    this.maxHp = 120 + (waveLevel * 20);
    this.hp = this.maxHp;

    this.speedX = 2.2 + (waveLevel * 0.1);
    this.oscillationAngle = 0;

    this.lastSpawnTime = 0;
    this.spawnInterval = 1800 - (waveLevel * 100);
  }

  update(currentTime) {
    if (this.y < this.targetY) {
      this.y += 2.5;
    } else {
      this.x += this.speedX;
      this.y = this.targetY + sin(this.oscillationAngle) * 35;
      this.oscillationAngle += 0.025;
      if (this.x > width - this.size || this.x < this.size) {
        this.speedX *= -1;
      }

      if (currentTime - this.lastSpawnTime > this.spawnInterval) {
        ghosts.push(new Ghost(currentWave, true, this.x, this.y + 20));
        this.lastSpawnTime = currentTime;
      }
    }
  }

  render() {
    let fr = floor(millis() / 160) % 3;
    image(bossImg, this.x, this.y, 85, 170, fr * 32, 0, 32, 64);

    let barWidth = 180;
    let barHeight = 12;
    let bx = this.x - barWidth / 2;
    let by = this.y - this.size * 0.85;

    fill(35);
    rect(bx, by, barWidth, barHeight, 4);

    let currentBarWidth = map(this.hp, 0, this.maxHp, 0, barWidth);
    fill(255, 90, 0);
    rect(bx, by, currentBarWidth, barHeight, 4);

    stroke(255, 150, 0);
    strokeWeight(1.5);
    noFill();
    rect(bx, by, barWidth, barHeight, 4);
  }
}