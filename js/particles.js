/**
 * Smoke Plume Particle System + Gaussian Plume Model Visualization
 * Fixed version with proper canvas sizing and DPR handling
 */

(function () {
    'use strict';

    /* =============================================
       HELPER: Properly size a canvas for HiDPI
       ============================================= */
    function setupCanvas(canvas, width, height) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr);
        return ctx;
    }

    /* =============================================
       HERO SMOKE PARTICLES
       ============================================= */

    class SmokeParticle {
        constructor(w, h) {
            this.w = w;
            this.h = h;
            this.reset(true);
        }

        reset(scatter) {
            this.x = Math.random() * this.w;
            this.y = scatter ? Math.random() * this.h : this.h + Math.random() * 30;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.3) * 0.6;
            this.speedY = -(Math.random() * 1.2 + 0.3);
            this.opacity = Math.random() * 0.25 + 0.08;
            this.fadeRate = Math.random() * 0.002 + 0.0008;
            this.life = scatter ? Math.random() * 150 : 0;
            this.maxLife = Math.random() * 200 + 120;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life++;
            this.size += 0.015;
            this.speedX += (Math.random() - 0.5) * 0.04;

            if (this.life > this.maxLife * 0.5) {
                this.opacity -= this.fadeRate;
            }

            if (this.opacity <= 0 || this.y < -30 || this.x < -30 || this.x > this.w + 30) {
                this.reset(false);
            }
        }

        // draw(ctx) {
        //     if (this.opacity <= 0) return;
        //     ctx.save();
        //     ctx.globalAlpha = this.opacity;
        //     ctx.fillStyle = 'rgba(210, 210, 220, 1)';
        //     ctx.beginPath();
        //     ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        //     ctx.fill();
        //     ctx.restore();
        // }
        reset(scatter) {
            this.x = Math.random() * this.w;
            this.y = scatter ? Math.random() * this.h : this.h + Math.random() * 30;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.3) * 0.6;
            this.speedY = -(Math.random() * 1.2 + 0.3);
            //this.opacity = Math.random() * 0.35 + 0.15;       // ← higher minimum
            this.opacity = Math.random() * 0.4 + 0.8;   
            this.fadeRate = Math.random() * 0.002 + 0.0008;
            this.life = scatter ? Math.random() * 150 : 0;
            this.maxLife = Math.random() * 200 + 120;

            // Random color per particle
            const type = Math.random();
            if (type < 0.3) {
                // Warm ember
                this.color = `rgb(255, ${150 + Math.floor(Math.random() * 80)}, ${50 + Math.floor(Math.random() * 50)})`;
            } else if (type < 0.6) {
                // Cool white smoke
                this.color = `rgb(${220 + Math.floor(Math.random() * 35)}, ${220 + Math.floor(Math.random() * 35)}, ${230 + Math.floor(Math.random() * 25)})`;
            } else {
                // Gray ash
                this.color = `rgb(${160 + Math.floor(Math.random() * 40)}, ${160 + Math.floor(Math.random() * 40)}, ${170 + Math.floor(Math.random() * 30)})`;
            }
        }

        draw(ctx) {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;  // ← uses the per-particle color
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function initHeroParticles() {
        const canvas = document.getElementById('plumeCanvas');
        if (!canvas) return;

        let w, h, ctx, particles;
        const COUNT = 80;
        let animId = null;
        let running = true;

        function resize() {
            const parent = canvas.parentElement;
            if (!parent) return;
            w = parent.offsetWidth;
            h = parent.offsetHeight;
            ctx = setupCanvas(canvas, w, h);

            // Recreate particles with new bounds
            particles = [];
            for (let i = 0; i < COUNT; i++) {
                particles.push(new SmokeParticle(w, h));
            }
        }

        function animate() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.w = w;
                p.h = h;
                p.update();
                p.draw(ctx);
            });
            animId = requestAnimationFrame(animate);
        }

        resize();
        animate();

        window.addEventListener('resize', () => {
            resize();
        });

        // Visibility optimization
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!running) {
                        running = true;
                        animate();
                    }
                } else {
                    running = false;
                    if (animId) cancelAnimationFrame(animId);
                }
            });
        }, { threshold: 0.05 });
        observer.observe(canvas);
    }

    /* =============================================
       GAUSSIAN PLUME MODEL VISUALIZATION
       ============================================= */

    function initPlumeModel() {
        const canvas = document.getElementById('plumeVisualization');
        if (!canvas) return;

        let w, h, ctx;
        let windSpeed = 5;
        let time = 0;
        let smokeParticles = [];
        const MAX_PARTICLES = 400;
        let animId = null;
        let running = true;
        let sourceX, sourceY;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            ctx = setupCanvas(canvas, w, h);
            sourceX = w * 0.08;
            sourceY = h * 0.45;
        }

        // Controls
        const buttons = document.querySelectorAll('.plume-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                windSpeed = parseFloat(btn.dataset.wind);
                smokeParticles = [];
            });
        });

        // Gaussian concentration (simplified 2D)
        function gaussianC(x, y) {
            if (x <= 0) return 0;
            const sigY = 0.08 * x * Math.pow(1 + 0.0001 * x, -0.5);
            const sigZ = 0.06 * x * Math.pow(1 + 0.0015 * x, -0.5);
            if (sigY === 0 || sigZ === 0) return 0;
            const U = Math.max(windSpeed, 0.5);
            const expY = Math.exp(-0.5 * Math.pow(y / sigY, 2));
            return (100 / (2 * Math.PI * sigY * sigZ * U)) * expY;
        }

        // Emit particle
        function emit() {
            const spread = Math.max(0.5, 3 / Math.sqrt(windSpeed));
            return {
                x: sourceX,
                y: sourceY + (Math.random() - 0.5) * 8,
                vx: (windSpeed * 0.8 + Math.random() * windSpeed * 0.4) * 0.5,
                vy: (Math.random() - 0.5) * spread * 0.5,
                size: Math.random() * 3 + 2,
                grow: Math.random() * 0.05 + 0.02,
                opacity: Math.random() * 0.45 + 0.25,
                fade: 0.001 + Math.random() * 0.002,
                warm: Math.random() > 0.5
            };
        }

        // Draw concentration heatmap
        function drawHeatmap() {
            const step = 8;
            for (let cx = 0; cx < w; cx += step) {
                for (let cy = 0; cy < h; cy += step) {
                    const px = (cx - sourceX) * 2;
                    const py = cy - sourceY;
                    const c = gaussianC(px, py);
                    if (c > 0.0001) {
                        const intensity = Math.min(1, c * 500);
                        const r = Math.floor(255 * Math.pow(intensity, 0.6));
                        const g = Math.floor(120 * Math.pow(intensity, 1.2));
                        const b = Math.floor(50 * intensity);
                        const a = Math.min(0.35, intensity * 0.45);
                        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                        ctx.fillRect(cx, cy, step, step);
                    }
                }
            }
        }

        // Update smoke particles
        function updateParticles() {
            const rate = Math.max(1, Math.floor(windSpeed * 0.5));
            for (let i = 0; i < rate; i++) {
                if (smokeParticles.length < MAX_PARTICLES) {
                    smokeParticles.push(emit());
                }
            }

            smokeParticles.forEach(p => {
                const dist = p.x - sourceX;
                const spread = Math.sqrt(Math.max(0, dist)) * 0.01;
                p.x += p.vx + Math.sin(time * 0.02 + p.y * 0.1) * 0.3;
                p.y += p.vy + Math.cos(time * 0.03 + p.x * 0.05) * (0.3 + spread);
                p.vy += (Math.random() - 0.5) * spread * 0.5;
                p.vy -= 0.008; // buoyancy
                p.size += p.grow;
                p.opacity -= p.fade;
            });

            smokeParticles = smokeParticles.filter(
                p => p.opacity > 0 && p.x < w + 50 && p.y > -50 && p.y < h + 50
            );
        }

        // Draw smoke particles
        function drawParticles() {
            smokeParticles.forEach(p => {
                if (p.opacity <= 0) return;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                if (p.warm) {
                    grad.addColorStop(0, 'rgba(255,160,80,0.7)');
                    grad.addColorStop(0.5, 'rgba(200,100,50,0.25)');
                    grad.addColorStop(1, 'rgba(150,80,40,0)');
                } else {
                    grad.addColorStop(0, 'rgba(200,200,215,0.5)');
                    grad.addColorStop(0.5, 'rgba(160,160,175,0.15)');
                    grad.addColorStop(1, 'rgba(130,130,145,0)');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // Draw fire source
        function drawSource() {
            // Glow
            const glow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, 40);
            glow.addColorStop(0, 'rgba(255,100,0,0.4)');
            glow.addColorStop(0.5, 'rgba(255,50,0,0.1)');
            glow.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sourceX, sourceY, 40, 0, Math.PI * 2);
            ctx.fill();

            // Emoji
            ctx.fillStyle = '#ff6600';
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔥', sourceX, sourceY);
        }

        // Draw wind arrow
        function drawWind() {
            const x = w - 130;
            const y = 20;
            ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`Wind: ${windSpeed} m/s`, x, y);

            const arrowY = y + 18;
            const arrowLen = Math.min(90, windSpeed * 3 + 20);

            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, arrowY);
            ctx.lineTo(x + arrowLen, arrowY);
            ctx.stroke();

            // Head
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(x + arrowLen, arrowY);
            ctx.lineTo(x + arrowLen - 8, arrowY - 4);
            ctx.lineTo(x + arrowLen - 8, arrowY + 4);
            ctx.closePath();
            ctx.fill();

            // Animated dashes
            for (let i = 0; i < 3; i++) {
                const lx = x + ((time * windSpeed * 0.3 + i * 25) % (arrowLen + 20)) - 10;
                if (lx >= x && lx <= x + arrowLen) {
                    ctx.strokeStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(lx, arrowY + 10 + i * 6);
                    ctx.lineTo(lx + 12, arrowY + 10 + i * 6);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // Draw legend
        function drawLegend() {
            ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('PM2.5', 15, 15);

            const grad = ctx.createLinearGradient(15, 22, 15, 110);
            grad.addColorStop(0, 'rgba(255,100,0,0.8)');
            grad.addColorStop(0.4, 'rgba(255,160,80,0.4)');
            grad.addColorStop(1, 'rgba(50,50,80,0.05)');
            ctx.fillStyle = grad;
            ctx.fillRect(15, 22, 14, 88);

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(15, 22, 14, 88);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '9px Inter, sans-serif';
            ctx.fillText('High', 34, 32);
            ctx.fillText('Low', 34, 108);
            ctx.restore();
        }

        // Draw distance scale
        function drawScale() {
            const y = h - 20;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(sourceX, y);
            ctx.lineTo(w - 15, y);
            ctx.stroke();

            [0, 5, 10, 20, 50].forEach(d => {
                const x = sourceX + d * (w - sourceX - 20) / 50;
                if (x < w - 10) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - 4);
                    ctx.lineTo(x, y + 4);
                    ctx.stroke();
                    ctx.fillText(`${d}km`, x, y + 15);
                }
            });
            ctx.restore();
        }

        // Draw subtle grid
        function drawGrid() {
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        }

        // Main render loop
        function render() {
            if (!running) return;

            ctx.fillStyle = '#0a1628';
            ctx.fillRect(0, 0, w, h);

            drawGrid();
            drawHeatmap();
            updateParticles();
            drawParticles();
            drawSource();
            drawWind();
            drawLegend();
            drawScale();

            time++;
            animId = requestAnimationFrame(render);
        }

        resize();
        render();

        window.addEventListener('resize', resize);

        // Pause when offscreen
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!running) { running = true; render(); }
                } else {
                    running = false;
                    if (animId) cancelAnimationFrame(animId);
                }
            });
        }, { threshold: 0.05 });
        observer.observe(canvas);
    }

    /* =============================================
       MINI GLOBE
       ============================================= */

    function initMiniGlobe() {
        const canvas = document.getElementById('miniGlobe');
        if (!canvas) return;

        const size = 120;
        canvas.width = size * (window.devicePixelRatio || 1);
        canvas.height = size * (window.devicePixelRatio || 1);
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 5;
        let rotation = 0;

        const lands = [
            { x: -30, y: -25, w: 35, h: 30 },
            { x: -20, y: 10, w: 20, h: 35 },
            { x: 15, y: -20, w: 20, h: 50 },
            { x: 35, y: -30, w: 40, h: 35 },
            { x: 55, y: 15, w: 18, h: 15 },
        ];

        const fires = [
            { x: -25, y: -15 },
            { x: -15, y: 5 },
            { x: 20, y: -5 },
            { x: 50, y: -20 },
            { x: 55, y: 20 },
        ];

        function draw() {
            ctx.clearRect(0, 0, size, size);

            // Ocean
            const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            ocean.addColorStop(0, '#1a5276');
            ocean.addColorStop(1, '#0e2f44');
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = ocean;
            ctx.fill();

            // Clip to globe
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip();

            // Continents
            ctx.fillStyle = '#2d6a4f';
            lands.forEach(land => {
                const ox = ((land.x + rotation) % 180) - 90;
                const s = Math.cos(ox * Math.PI / 180);
                if (s > 0) {
                    const px = cx + ox * r / 90;
                    const py = cy + land.y * r / 60;
                    ctx.beginPath();
                    ctx.ellipse(px, py, Math.max(1, (land.w * s * r) / 180), Math.max(1, (land.h * r) / 120), 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Fires
            fires.forEach(dot => {
                const ox = ((dot.x + rotation) % 180) - 90;
                const s = Math.cos(ox * Math.PI / 180);
                if (s > 0.1) {
                    const px = cx + ox * r / 90;
                    const py = cy + dot.y * r / 60;
                    const flicker = 1.5 + Math.sin(rotation * 0.15 + dot.x) * 0.8;

                    const glow = ctx.createRadialGradient(px, py, 0, px, py, flicker * 3);
                    glow.addColorStop(0, `rgba(255,100,0,${0.5 * s})`);
                    glow.addColorStop(1, 'rgba(255,50,0,0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(px, py, flicker * 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = `rgba(255,180,0,${0.8 * s})`;
                    ctx.beginPath();
                    ctx.arc(px, py, flicker, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.restore();

            // Outline
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Atmosphere
            const atmo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.12);
            atmo.addColorStop(0, 'rgba(100,180,255,0)');
            atmo.addColorStop(0.6, 'rgba(100,180,255,0.04)');
            atmo.addColorStop(1, 'rgba(100,180,255,0)');
            ctx.fillStyle = atmo;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
            ctx.fill();

            rotation += 0.3;
            if (rotation > 360) rotation -= 360;
            requestAnimationFrame(draw);
        }

        draw();
    }

    /* =============================================
       MINI CARD PARTICLES (fire embers / smoke wisps)
       ============================================= */

    function initCardParticles(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        container.style.position = 'relative';
        container.appendChild(canvas);

        let w, h, ctx;
        let particles = [];
        const MAX = 25;

        function resize() {
            w = container.offsetWidth;
            h = container.offsetHeight;
            if (w === 0 || h === 0) return;
            ctx = setupCanvas(canvas, w, h);
        }

        function emit() {
            if (particles.length >= MAX) return;
            const isFire = type === 'fire';
            particles.push({
                x: w * 0.2 + Math.random() * w * 0.6,
                y: h + 3,
                vx: (Math.random() - 0.5) * (isFire ? 1.2 : 0.6),
                vy: -(Math.random() * 1.2 + 0.4),
                size: Math.random() * (isFire ? 3.5 : 2.5) + 1,
                opacity: Math.random() * 0.35 + 0.1,
                fade: 0.004 + Math.random() * 0.004,
                r: isFire ? 255 : 180 + Math.random() * 30,
                g: isFire ? 100 + Math.floor(Math.random() * 80) : 180 + Math.random() * 30,
                b: isFire ? 0 : 200 + Math.random() * 20,
            });
        }

        function animate() {
            if (!ctx || w === 0) {
                resize();
                requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, w, h);

            if (Math.random() > 0.4) emit();

            particles.forEach(p => {
                p.x += p.vx + (Math.random() - 0.5) * 0.2;
                p.y += p.vy;
                p.size += 0.02;
                p.opacity -= p.fade;
            });

            particles = particles.filter(p => p.opacity > 0 && p.y > -10);

            particles.forEach(p => {
                if (p.opacity <= 0) return;
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(animate);
        }

        // Wait for container to have dimensions
        function tryStart() {
            resize();
            if (w > 0 && h > 0) {
                animate();
            } else {
                setTimeout(tryStart, 200);
            }
        }

        tryStart();
        window.addEventListener('resize', resize);
    }

    /* =============================================
       INITIALIZE ALL
       ============================================= */

    function init() {
        // Hero smoke
        initHeroParticles();

        // Mini globe
        initMiniGlobe();

        // Gaussian plume
        initPlumeModel();

        // Card particles
        initCardParticles('fireParticles', 'fire');
        initCardParticles('smokeParticles', 'smoke');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure layout is settled
        setTimeout(init, 100);
    }

})();