let ghosts = [];
let flashes = [];
let stars = [];
let tombstones = [];
let pumpkins = [];
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < 40; i++) {
    stars.push({ x: random(width), y: random(height * 0.6), size: random(1, 2.5), brightness: random(100, 255) });
  }

  let tombstoneCount = Math.floor(width / 120);
  for (let i = 0; i < tombstoneCount; i++) {
    tombstones.push({
      x: random(i * 120, (i + 1) * 120 - 30),
      w: random(20, 30),
      h: random(35, 50)
    });
  }

  for (let i = 0; i < 4; i++) {
    pumpkins.push({
      x: random(50, width - 50),
      y: height - 25,
      size: random(25, 35)
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

  for (let s of stars) {
    fill(255, 255, 200, s.brightness);
    if (random(1) > 0.96) s.brightness = random(100, 255);
    noStroke();
    circle(s.x, s.y, s.size);
  }

  fill(255, 140, 0, 20);
  circle(120, 120, 140);
  fill(255, 180, 50, 40);
  circle(120, 120, 110);
  fill(255, 220, 100);
  circle(120, 120, 95);

  fill(15, 5, 25);
  push();
  translate(110, 100);
  scale(0.7);
  triangle(0, 0, -20, -10, -5, 5);
  triangle(0, 0, 20, -10, 5, 5);
  pop();

  push();
  translate(150, 130);
  scale(0.5);
  triangle(0, 0, -20, -10, -5, 5);
  triangle(0, 0, 20, -10, 5, 5);
  pop();

  for (let t of tombstones) {
    fill(80, 85, 95);
    noStroke();
    rect(t.x, height - 40 - t.h, t.w, t.h, 8, 8, 0, 0);
    stroke(40);
    strokeWeight(2);
    line(t.x + t.w / 2, height - 40 - t.h + 10, t.x + t.w / 2, height - 40 - t.h + 28);
    line(t.x + t.w / 2 - 6, height - 40 - t.h + 16, t.x + t.w / 2 + 6, height - 40 - t.h + 16);
  }

  noStroke();
  fill(15, 20, 15);
  rect(0, height - 40, width, 40);

  stroke(50, 200, 100, 90);
  strokeWeight(3);
  line(0, height - 40, width, height - 40);

  for (let p of pumpkins) {
    noStroke();
    fill(230, 90, 10);
    ellipse(p.x, p.y, p.size, p.size * 0.85);
    fill(50, 120, 40);
    rect(p.x - 2, p.y - p.size * 0.5, 4, 6);
    fill(255, 200, 0);
    triangle(p.x - 5, p.y - 2, p.x - 2, p.y - 5, p.x - 1, p.y - 2);
    triangle(p.x + 1, p.y - 2, p.x + 2, p.y - 5, p.x + 5, p.y - 2);
    arc(p.x, p.y + 4, 10, 6, 0, PI, CHORD);
  }

  for (let f of flashes) {
    stroke(0, 255, 180, f.alpha);
    strokeWeight(4);
    line(f.x1, f.y1, f.x2, f.y2);
  }

  if (currentBoss) {
    currentBoss.render();
  }

  for (let g of ghosts) {
    g.render();
  }

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
    let d = dist(mouseX, mouseY, currentBoss.x, currentBoss.y);
    if (d < currentBoss.size / 1.8) {
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
      this.r = 220; this.g = 240; this.b = 255;
    }
  }

  update() {
    this.y += this.speed;
    this.x += sin(this.oscillation) * (this.isMinion ? 2.2 : 1.2);
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.oscillation += 0.05;
  }

  render() {
    noStroke();
    fill(this.r, this.g, this.b, 210);
    ellipse(this.x, this.y, this.size, this.size * 1.2);
    rect(this.x - this.size / 2, this.y, this.size, this.size * 0.5);

    fill(10, 5, 25);
    circle(this.x - this.size * 0.18, this.y - 2, this.isMinion ? 4 : 5);
    circle(this.x + this.size * 0.18, this.y - 2, this.isMinion ? 4 : 5);
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
    noStroke();
    fill(60, 20, 90, 230);
    ellipse(this.x, this.y, this.size, this.size * 1.3);
    rect(this.x - this.size / 2, this.y, this.size, this.size * 0.6);

    for (let i = -2; i <= 2; i++) {
      ellipse(this.x + (i * this.size * 0.2), this.y + this.size * 0.6, this.size * 0.24, this.size * 0.35);
    }

    fill(255, 60, 0);
    ellipse(this.x - this.size * 0.22, this.y - 12, 22, 28);
    ellipse(this.x + this.size * 0.22, this.y - 12, 22, 28);
    fill(255, 230, 0);
    circle(this.x - this.size * 0.2, this.y - 10, 8);
    circle(this.x + this.size * 0.24, this.y - 10, 8);

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