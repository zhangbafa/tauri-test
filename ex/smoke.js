const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const smokeParticles = [];
const numberOfParticles = 100;

// 调整粒子数量
const adjustParticles = () => {
    smokeParticles.length = 0;
    for (let i = 0; i < numberOfParticles; i++) {
        smokeParticles.push(new SmokeParticle());
    }
};

// 窗口大小调整时重新设置画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustParticles();
});

class SmokeParticle {
    constructor() {
        this.x = canvas.width / 2; // 烟雾中心点
        this.y = canvas.height / 2;
        this.size = Math.random() * 10 + 5; // 粒子大小
        this.speedX = Math.random() * 2 - 1; // 水平速度
        this.speedY = Math.random() * 2 - 1; // 垂直速度
        this.opacity = Math.random() * 0.5 + 0.1; // 初始透明度
        this.color = `rgba(169, 169, 169, ${this.opacity})`; // 烟雾颜色
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 粒子逐渐变大
        if (this.size < 50) this.size += 0.1;

        // 粒子逐渐变淡
        if (this.opacity > 0) this.opacity -= 0.005;

        // 粒子消失后重置
        if (this.opacity <= 0) {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.size = Math.random() * 10 + 5;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = `rgba(169, 169, 169, ${this.opacity})`;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const handleParticles = () => {
    for (let i = 0; i < smokeParticles.length; i++) {
        smokeParticles[i].update();
        smokeParticles[i].draw();
    }
};

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
};

adjustParticles();
animate();