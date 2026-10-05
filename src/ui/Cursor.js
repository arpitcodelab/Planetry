export class CustomCursor {
  constructor() {
    this.cursorDot = null;
    this.cursorRing = null;
    this.mouse = { x: -100, y: -100 };
    this.ring = { x: -100, y: -100 };
    this.isHovering = false;
    this.init();
  }

  init() {
    // Only initialize on devices with mouse/pointer
    if (window.matchMedia('(hover: none)').matches) return;

    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'custom-cursor-dot';

    this.cursorRing = document.createElement('div');
    this.cursorRing.className = 'custom-cursor-ring';

    document.body.appendChild(this.cursorDot);
    document.body.appendChild(this.cursorRing);

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (this.cursorDot) {
        this.cursorDot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0)`;
      }
    });

    // Animate trailing ring with buttery smooth lerp
    const loop = () => {
      this.ring.x += (this.mouse.x - this.ring.x) * 0.15;
      this.ring.y += (this.mouse.y - this.ring.y) * 0.15;

      if (this.cursorRing) {
        const scale = this.isHovering ? 1.9 : 1.0;
        this.cursorRing.style.transform = `translate3d(${this.ring.x}px, ${this.ring.y}px, 0) scale(${scale})`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Bind interactive elements
    this.bindInteractives();
  }

  bindInteractives() {
    const targets = document.querySelectorAll('button, a, input, [data-interactive], .hud-chapter-item, .sound-toggle-btn');
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.isHovering = true;
        if (this.cursorRing) this.cursorRing.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        this.isHovering = false;
        if (this.cursorRing) this.cursorRing.classList.remove('cursor-hover');
      });
    });
  }
}
