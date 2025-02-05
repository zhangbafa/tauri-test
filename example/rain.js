const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rainDrops = [];
const numberOfRainDrops = 500;

// 调整雨滴数量
const adjustRainDrops = () => {
    rainDrops.length = 0;
    for (let i = 0; i < numberOfRainDrops; i++) {
        rainDrops.push(new RainDrop());
    }
};

// 窗口大小调整时重新设置画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustRainDrops();
});

class RainDrop {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.length = Math.random() * 20 + 10; // 雨滴长度
        this.speed = Math.random() * 4 + 2; // 雨滴下落速度
        this.opacity = Math.random() * 0.5 + 0.2; // 雨滴透明度
    }

    update() {
        this.y += this.speed;

        // 雨滴移出画布时重置
        if (this.y > canvas.height) {
            this.y = Math.random() * -50; // 从画布顶部重新开始
            this.x = Math.random() * canvas.width;
            this.length = Math.random() * 20 + 10;
            this.speed = Math.random() * 4 + 2;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
    }

    draw() {
        ctx.strokeStyle = `rgba(174, 194, 224, ${this.opacity})`; // 雨滴颜色
        ctx.lineWidth = 10; // 雨滴宽度
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
    }
}

const handleRainDrops = () => {
    for (let i = 0; i < rainDrops.length; i++) {
        rainDrops[i].update();
        rainDrops[i].draw();
    }
};

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleRainDrops();
    requestAnimationFrame(animate);
};

adjustRainDrops();
animate();