import './styles.css';

export class UIOverlay {
  readonly container: HTMLElement;
  private transitionOverlay: HTMLElement;
  private loadingOverlay: HTMLElement;
  private loadingBar: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.id = 'ui-overlay';
    parent.appendChild(this.container);

    // Loading overlay
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'loading-overlay';
    this.loadingOverlay.innerHTML = `
      <div class="loading-text">Pirate Adventure</div>
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
    `;
    this.container.appendChild(this.loadingOverlay);
    this.loadingBar = this.loadingOverlay.querySelector('.loading-bar')!;

    // Transition overlay (fade to black)
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'transition-overlay';
    this.container.appendChild(this.transitionOverlay);
  }

  setLoadingProgress(pct: number): void {
    this.loadingBar.style.width = `${Math.min(100, pct)}%`;
  }

  hideLoading(): void {
    this.loadingOverlay.classList.add('hidden');
    setTimeout(() => {
      this.loadingOverlay.style.display = 'none';
    }, 500);
  }

  fadeToBlack(): void {
    this.transitionOverlay.classList.add('active');
  }

  fadeFromBlack(): void {
    this.transitionOverlay.classList.remove('active');
  }

  dispose(): void {
    this.container.remove();
  }
}
