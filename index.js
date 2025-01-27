
// Canvas setup
const Canvas = document.getElementById("canvas1");
const Canvas_2 = document.getElementById("canvas2");
const context = Canvas.getContext("2d");
const context_2 = Canvas_2.getContext("2d");

// Game variables
let shots = 5;
let gameActive = true;
let toNextRaven = 0;
let intervalForNext = 400;
let lastTime = 0;
let score = 0;
let raven = [];
let explosion_Array = [];
const trailParticles = [];

// Resize handler
function resizeCanvases() {
    Canvas.width = window.innerWidth;
    Canvas.height = window.innerHeight;
    Canvas_2.width = window.innerWidth;
    Canvas_2.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Raven class
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 195;
        this.SizeModification = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.SizeModification;
        this.height = this.spriteHeight * this.SizeModification;
        this.x = Canvas.width;
        this.y = Math.random() * (Canvas.height - this.height);
        this.Xdirection = Math.random() * 5 + 3;
        this.Ydirection = Math.random() * 5 - 2.5;
        this.spriteImage = new Image();
        this.spriteImage.src = "./Sprite/raven.png"; // Replace with your image path
        this.frame = 0;
        this.maxframe = 4;
        this.timeSinceFlap = 0;
        this.FlapInterval = Math.random() * 50 + 50;
        this.random = [
            Math.floor(Math.random() * 55),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ];
        this.color = `rgb(${this.random[0]},${this.random[1]},${this.random[2]})`;
        this.markedForDeleting = false;
    }

    update(delta_time) {
        if (this.y > Canvas.height - this.height || this.y < 0) {
            this.Ydirection *= -1;
        }
        this.x -= this.Xdirection;
        this.y += this.Ydirection;

        if (this.x < -this.width) this.markedForDeleting = true;
        
        this.timeSinceFlap += delta_time;
        if (this.timeSinceFlap > this.FlapInterval) {
            this.frame = this.frame < this.maxframe ? this.frame + 1 : 0;
            this.timeSinceFlap = 0;
        }

        // Create dust particles
        if (gameActive && Math.random() < 0.4) {
            trailParticles.push(new Particle(
                this.x + this.width/2,
                this.y + this.height/2
            ));
        }
    }

    draw() {
        context_2.fillStyle = this.color;
        context_2.fillRect(this.x, this.y, this.width, this.height);
        context.drawImage(
            this.spriteImage,
            this.frame * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

// Explosion class
class Explosion {
    constructor(x, y, size) {
        this.spriteImage = new Image();
        this.spriteImage.src = "./Sprite/boom.png"; // Replace with your image path
        this.sprite_width = 200;
        this.sprite_height = 179;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.SoundEffect = new Audio();
        this.SoundEffect.src = "./soundEffect/Fire impact 1.wav"; // Replace with your sound path
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.size = size;
        this.markedForDeleting = false;
        this.hasPlayedSound = false;
    }

    update(delta_time) {
        if (!this.hasPlayedSound) {
            this.SoundEffect.play();
            this.hasPlayedSound = true;
        }
        
        this.timeSinceLastFrame += delta_time;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeleting = true;
        }
    }

    draw() {
        context.drawImage(
            this.spriteImage,
            this.frame * this.sprite_width,
            0,
            this.sprite_width,
            this.sprite_height,
            this.x,
            this.y,
            this.size,
            this.size
        );
    }
}

// Particle class for dust trails
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.opacity = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.02;
        this.size *= 0.97;
    }

    draw() {
        context.save();
        context.globalAlpha = this.opacity;
        context.fillStyle = 'rgba(150, 150, 150, 0.5)';
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

// Click handler
window.addEventListener("click", (e) => {
    if (!gameActive) return;
    
    const rect = Canvas_2.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pixel = context_2.getImageData(x, y, 1, 1).data;
    let hit = false;
    
    raven.forEach(obj => {
        if (pixel[0] === obj.random[0] && 
            pixel[1] === obj.random[1] && 
            pixel[2] === obj.random[2]) {
            hit = true;
            score++;
            obj.markedForDeleting = true;
            explosion_Array.push(new Explosion(obj.x, obj.y, obj.width));
        }
    });

    if (!hit && shots > 0) {
        shots--;
        Canvas.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
        setTimeout(() => Canvas.style.transform = '', 100);
    }
});

// Animation loop
function animate(timestamp) {
    if (!gameActive) {
        context.fillStyle = "red";
        context.font = "80px Impact";
        context.textAlign = "center";
        context.fillText("GAME OVER", Canvas.width/2, Canvas.height/2);
        context.font = "30px Arial";
        context.fillText("Refresh to play again", Canvas.width/2, Canvas.height/2 + 50);
        return;
    }

    context.clearRect(0, 0, Canvas.width, Canvas.height);
    context_2.clearRect(0, 0, Canvas.width, Canvas.height);

    // Update particles
    trailParticles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.opacity <= 0) {
            trailParticles.splice(index, 1);
        }
    });

    const delta_time = timestamp - lastTime;
    lastTime = timestamp;
    toNextRaven += delta_time;

    if (toNextRaven > intervalForNext) {
        raven.push(new Raven());
        toNextRaven = 0;
        raven.sort((a, b) => a.width - b.width);
    }

    raven.forEach(obj => obj.update(delta_time));
    explosion_Array.forEach(obj => obj.update(delta_time));
    raven.forEach(obj => obj.draw());
    explosion_Array.forEach(obj => obj.draw());

    // Draw UI
    context.fillStyle = "white";
    context.font = "50px Impact";
    context.textAlign = "left";
    context.fillText("Score: " + score, 50, 70);
    
    context.fillStyle = shots < 2 ? "red" : "white";
    context.fillText("Shots: " + shots, 50, 130);

    // Cleanup
    raven = raven.filter(obj => !obj.markedForDeleting);
    explosion_Array = explosion_Array.filter(obj => !obj.markedForDeleting);

    // Check game over
    if (shots <= 0) gameActive = false;

    requestAnimationFrame(animate);
}

animate(0);
