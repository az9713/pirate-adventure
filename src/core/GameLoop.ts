export type UpdateCallback = (dt: number) => void;

export class GameLoop {
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private callbacks: UpdateCallback[] = [];

  addCallback(cb: UpdateCallback): void {
    this.callbacks.push(cb);
  }

  removeCallback(cb: UpdateCallback): void {
    const idx = this.callbacks.indexOf(cb);
    if (idx !== -1) this.callbacks.splice(idx, 1);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // cap at 100ms
    this.lastTime = now;

    for (const cb of this.callbacks) {
      cb(dt);
    }
  };
}
